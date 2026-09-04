import { Router, type IRouter } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  problemsTable,
  attemptsTable,
  answersTable,
  topicsTable,
} from "@workspace/db";
import {
  GetAssignmentResponse,
  ListAssignmentsResponse,
  SaveAnswerBody,
  StartAssignmentAttemptResponse,
  GetAttemptResponse,
  SubmitAttemptResponse,
} from "@workspace/api-zod";
import { gradeAnswer } from "../lib/grading";
import { detect } from "../lib/detection";
import { checkMeter, recordAiOutput } from "../lib/metering";

const router: IRouter = Router();

const MCQ_BY_ASSIGNMENT_TITLE: Record<
  string,
  { stem: string; options: string[] }
> = {
  "Homework 1 — Foundations of prompting": {
    stem:
      "A model supplies confident-looking citations, but some do not exist. Which explanation best shows what happened?",
    options: [
      "The model predicts plausible text patterns; a confident style does not verify that a citation is real.",
      "The model searches every journal correctly, but remote-work research changes too quickly.",
      "Any citation in a response longer than one sentence automatically becomes unreliable.",
      "The model knows the papers are false but hides that fact whenever five sources are requested.",
    ],
  },
  "Homework 2 — Core techniques": {
    stem:
      "A zero-shot email classifier mishandles borderline messages. Which next step is most useful?",
    options: [
      "Add a few labeled borderline examples that show the intended category boundaries.",
      "Repeat each category name many times without examples.",
      "Remove the category definitions so the model has fewer words to process.",
      "Ask for a longer explanation after every label but change nothing else.",
    ],
  },
  "Midterm — Foundations and Core Techniques": {
    stem:
      "Which revision best repairs the vague prompt “Tell me about this customer feedback and what we should do”?",
    options: [
      "State the task, provide the feedback as delimited input, add the business context, and require a two-sentence summary plus one action.",
      "Add only the phrase “be accurate and helpful.”",
      "Ask the model to use more professional vocabulary.",
      "Repeat the original prompt three times.",
    ],
  },
  "Homework 3 — Advanced patterns and reliability": {
    stem:
      "An app breaks when it pattern-matches a price from conversational prose. Which fix is strongest?",
    options: [
      "Require a validated structured response with a dedicated numeric price field.",
      "Ask for an even friendlier paragraph and use the same pattern matching.",
      "Increase the model temperature so prices are formatted more creatively.",
      "Store the entire reply as the price without validation.",
    ],
  },
  "Homework 4 — Applications, safety, and systems": {
    stem:
      "A smooth contract summary omits payment deadlines and termination terms. What should the user request instead?",
    options: [
      "Explicit extraction of each payment deadline and termination clause in a structured list, with missing items reported.",
      "A shorter generic summary with no named fields.",
      "A more creative rewrite of the entire contract.",
      "A sentiment score for the vendor relationship.",
    ],
  },
  "Final — Prompt Engineering": {
    stem:
      "Which design best supports warm, role-specific rejection letters under 150 words without exposing private notes?",
    options: [
      "Use a clear role and task, explicit constraints, delimited private context marked as non-quotable, and a defined output format.",
      "Use only “write a rejection letter” and let the model infer every rule.",
      "Put private comments first and ask the model to copy the most specific details.",
      "Remove the word limit so the model has room to explain itself.",
    ],
  },
};

function applyShortAnswerPolicy(instructions: string | null): string {
  const cleaned = (instructions ?? "")
    .replace(/about 3[–-]5 sentences/gi, "about one sentence")
    .replace(/about 4[–-]6 sentences/gi, "one or two sentences")
    .replace(/in a few sentences/gi, "in one clear sentence");
  return `${cleaned}${cleaned ? "\n\n" : ""}Answer-length policy: for every written question, one clear sentence is normally enough, and no response needs more than two sentences. Grading is based on understanding and substance, not course jargon, wording, or length.`;
}

function multipleChoicePrompt(stem: string, options: string[]): string {
  return [
    "[MULTIPLE_CHOICE]",
    stem,
    "",
    ...options.map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`),
  ].join("\n");
}

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

router.get("/assignments", async (_req, res) => {
  const rows = await db
    .select()
    .from(assignmentsTable)
    .orderBy(asc(assignmentsTable.weekNumber), asc(assignmentsTable.position));
  const result = await Promise.all(
    rows.map(async (a) => {
      const counts = await db.execute(
        sql`select count(*)::int as n from problems where assignment_id = ${a.id}`,
      );
      const n = (counts.rows[0] as { n?: number } | undefined)?.n ?? 0;
      const attempts = await db
        .select()
        .from(attemptsTable)
        .where(eq(attemptsTable.assignmentId, a.id))
        .orderBy(asc(attemptsTable.id));
      const visibleAttempts = attempts.filter(
        (x) => x.status === "submitted" || x.status === "in_progress",
      );
      const submitted = visibleAttempts.filter((x) => x.status === "submitted");
      const inProgress = visibleAttempts.find((x) => x.status === "in_progress");
      const best = submitted.reduce(
        (b, x) => (x.scorePercent != null && x.scorePercent > b ? x.scorePercent : b),
        -1,
      );
      const status: "not_started" | "in_progress" | "submitted" = inProgress
        ? "in_progress"
        : submitted.length > 0
        ? "submitted"
        : "not_started";
      const last = visibleAttempts[visibleAttempts.length - 1];
      return {
        id: a.id,
        kind: a.kind as "homework" | "test" | "midterm" | "final",
        title: a.title,
        weekNumber: a.weekNumber,
        problemCount: n,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        status,
        bestScore: best < 0 ? null : best,
        lastAttemptId: last?.id ?? null,
      };
    }),
  );
  res.json(ListAssignmentsResponse.parse(result));
});

router.get("/assignments/:assignmentId", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.assignmentId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [a] = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, id));
  if (!a) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const problems = await db
    .select({
      id: problemsTable.id,
      position: problemsTable.position,
      prompt: problemsTable.prompt,
      topicId: problemsTable.topicId,
      topicTitle: topicsTable.title,
      hint: problemsTable.hint,
    })
    .from(problemsTable)
    .leftJoin(topicsTable, eq(problemsTable.topicId, topicsTable.id))
    .where(eq(problemsTable.assignmentId, id))
    .orderBy(asc(problemsTable.position));
  const mcq = MCQ_BY_ASSIGNMENT_TITLE[a.title];
  const presentedProblems = problems.map((problem, index) => {
    if (index === 0 && mcq) {
      return {
        ...problem,
        prompt: multipleChoicePrompt(mcq.stem, mcq.options),
      };
    }
    return {
      ...problem,
      prompt: `${problem.prompt}\n\nA single clear sentence is enough; answer in your own words.`,
    };
  });
  res.json(
    GetAssignmentResponse.parse({
      id: a.id,
      kind: a.kind as "homework" | "test" | "midterm" | "final",
      title: a.title,
      weekNumber: a.weekNumber,
      isTimed: a.isTimed,
      timeLimitMinutes: a.timeLimitMinutes,
      instructions: applyShortAnswerPolicy(a.instructions),
      problems: presentedProblems,
    }),
  );
});

async function loadAttempt(attemptId: number) {
  const [attempt] = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.id, attemptId));
  if (!attempt) return null;
  const answers = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.attemptId, attemptId));
  return {
    id: attempt.id,
    assignmentId: attempt.assignmentId,
    status: attempt.status as "in_progress" | "submitted",
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    deadlineAt: attempt.deadlineAt?.toISOString() ?? null,
    answers: answers.map((x) => ({
      problemId: x.problemId,
      answer: x.answer,
      keystrokeCount: x.keystrokeCount,
      eraseCount: x.eraseCount,
    })),
  };
}

router.post("/assignments/:assignmentId/start", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.assignmentId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [a] = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, id));
  if (!a) {
    res.status(404).json({ error: "assignment not found" });
    return;
  }

  // Resume any in-progress attempt
  const [existing] = await db
    .select()
    .from(attemptsTable)
    .where(and(eq(attemptsTable.assignmentId, id), eq(attemptsTable.status, "in_progress")));
  if (existing) {
    const state = await loadAttempt(existing.id);
    res.json(StartAssignmentAttemptResponse.parse(state));
    return;
  }

  const deadlineAt =
    a.isTimed && a.timeLimitMinutes
      ? new Date(Date.now() + a.timeLimitMinutes * 60_000)
      : null;
  const [created] = await db
    .insert(attemptsTable)
    .values({ assignmentId: id, status: "in_progress", deadlineAt })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed to create" });
    return;
  }
  const state = await loadAttempt(created.id);
  res.json(StartAssignmentAttemptResponse.parse(state));
});

router.get("/assignments/attempts/:attemptId", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const state = await loadAttempt(id);
  if (!state) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  res.json(GetAttemptResponse.parse(state));
});

router.put("/assignments/attempts/:attemptId/answer", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const parsed = SaveAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { problemId, answer, trace } = parsed.data;

  const [attempt] = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.id, id));
  if (!attempt) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  if (attempt.status !== "in_progress") {
    res.status(400).json({ error: "attempt already submitted" });
    return;
  }
  if (attempt.deadlineAt && new Date() > attempt.deadlineAt) {
    res.status(403).json({ error: "time limit exceeded" });
    return;
  }

  const [existing] = await db
    .select()
    .from(answersTable)
    .where(and(eq(answersTable.attemptId, id), eq(answersTable.problemId, problemId)));

  const values = {
    attemptId: id,
    problemId,
    answer,
    keystrokeCount: trace.keystrokeCount,
    eraseCount: trace.eraseCount,
    bulkInsertCount: trace.bulkInsertCount ?? 0,
    longestBulkInsertChars: trace.longestBulkInsertChars ?? 0,
    rewriteSegments: trace.rewriteSegments ?? 0,
    durationMs: trace.durationMs,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(answersTable).set(values).where(eq(answersTable.id, existing.id));
  } else {
    await db.insert(answersTable).values(values);
  }
  res.json({ ok: true });
});

router.post("/assignments/attempts/:attemptId/submit", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  if (!checkMeter(req, res)) return;
  const skipDetection =
    (req.body as { skipDetection?: boolean } | undefined)?.skipDetection === true;
  const [attempt] = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.id, id));
  if (!attempt) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  const [assignmentForAttempt] = await db
    .select({ title: assignmentsTable.title })
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, attempt.assignmentId));
  const assignmentMcq = assignmentForAttempt
    ? MCQ_BY_ASSIGNMENT_TITLE[assignmentForAttempt.title]
    : undefined;
  const problems = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.assignmentId, attempt.assignmentId))
    .orderBy(asc(problemsTable.position));
  const answers = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.attemptId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  const perProblem = [];
  const detection = [];
  let score = 0;
  for (const p of problems) {
    const a = byProblem.get(p.id);
    const userAnswer = a?.answer ?? "";
    const presentedMcq =
      p.position === problems[0]?.position ? assignmentMcq : undefined;
    const graded = await gradeAnswer({
      prompt: presentedMcq?.stem ?? p.prompt,
      correctAnswer: p.correctAnswer,
      userAnswer,
    });
    if (graded.correct) score += 1;
    recordAiOutput(req, graded.explanation);
    perProblem.push({
      problemId: p.id,
      correct: graded.correct,
      userAnswer,
      correctAnswer: p.correctAnswer,
      explanation: graded.explanation || p.explanation,
    });

    if (a && userAnswer.trim().length > 0 && !skipDetection) {
      const det = await detect(userAnswer, {
        keystrokeCount: a.keystrokeCount,
        eraseCount: a.eraseCount,
        bulkInsertCount: a.bulkInsertCount,
        longestBulkInsertChars: a.longestBulkInsertChars,
        rewriteSegments: a.rewriteSegments,
        durationMs: a.durationMs,
      });
      detection.push({ problemId: p.id, ...det });
      await db
        .update(answersTable)
        .set({
          correct: graded.correct,
          aiScore: det.aiScore,
          aiFlagged: det.aiFlagged,
          diachronicScore: det.diachronicScore,
          diachronicFlagged: det.diachronicFlagged,
          detectionRationale: det.rationale,
        })
        .where(eq(answersTable.id, a.id));
    } else if (a) {
      await db
        .update(answersTable)
        .set({ correct: graded.correct })
        .where(eq(answersTable.id, a.id));
    }
  }

  const total = problems.length;
  const percent = total === 0 ? 0 : (score / total) * 100;
  await db
    .update(attemptsTable)
    .set({
      status: "submitted",
      submittedAt: new Date(),
      scorePercent: percent,
    })
    .where(eq(attemptsTable.id, id));

  res.json(
    SubmitAttemptResponse.parse({
      attemptId: id,
      score,
      total,
      percent,
      perProblem,
      detection,
    }),
  );
});

export default router;
