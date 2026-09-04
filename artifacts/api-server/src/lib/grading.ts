import { chatJson } from "./ai";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\u2212\u2010-\u2015]/g, "-")
    .replace(/[$,]/g, "")
    .replace(/[)(\[\]{}]/g, "")
    .replace(/\s*=\s*/g, "=");
}

function asNumber(s: string): number | null {
  const cleaned = s.replace(/[$,%\s]/g, "").replace(/[\u2212]/g, "-");
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) return parseFloat(cleaned);
  const frac = cleaned.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) {
    const n = parseFloat(frac[1]!);
    const d = parseFloat(frac[2]!);
    if (d !== 0) return n / d;
  }
  return null;
}

export async function gradeAnswer(opts: {
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
}): Promise<{
  correct: boolean;
  explanation: string;
  confidence: number;
  evidence: string[];
}> {
  const user = opts.userAnswer ?? "";
  const correct = opts.correctAnswer ?? "";

  if (normalize(user) === normalize(correct)) {
    return {
      correct: true,
      explanation: `Correct. ${correct}`,
      confidence: 1,
      evidence: ["The response matches the reference answer after harmless formatting differences."],
    };
  }

  const u = asNumber(user);
  const c = asNumber(correct);
  if (u != null && c != null) {
    const tol = Math.max(0.01, Math.abs(c) * 0.01);
    if (Math.abs(u - c) <= tol) {
      return {
        correct: true,
        explanation: `Correct. The expected answer is ${correct}.`,
        confidence: 1,
        evidence: ["The numerical value is within the accepted tolerance."],
      };
    }
  }

  if (!user.trim()) {
    return {
      correct: false,
      explanation: `No answer was provided.`,
      confidence: 1,
      evidence: ["The submitted response is empty after whitespace is removed."],
    };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const out = await chatJson<{
        correct: boolean;
        explanation: string;
        confidence?: number;
        evidence?: string[];
      }>(
        [
          "You are a fair, intelligent grader of prompt-engineering understanding. This is not a vocabulary, memorization, or writing-style test. Judge SUBSTANCE ONLY.",
          "",
          "Core rule:",
          "- Give credit whenever the response demonstrates the needed understanding, even briefly, informally, or in completely different language from the course.",
          "- One accurate sentence can earn full credit. A long answer can also earn full credit. Length itself is never evidence for or against correctness.",
          "- Do not demand course jargon, named techniques, magic words, every detail in the reference, or the same example. Plain-language reasoning is preferred and fully acceptable.",
          "- Do not invent missing requirements. Ask only whether the student answered the actual question correctly enough to demonstrate understanding.",
          "",
          "About the reference answer:",
          "- `reference_answer` is a fallible aid, not a rubric and not ground truth. It may be longer, narrower, or wrong.",
          "- Never grade by word overlap or similarity to the reference.",
          "- If the student's answer is correct on the merits but differs from or contradicts the reference, mark it correct.",
          "",
          "Never lower the grade for grammar, spelling, capitalization, fragments, bullets, shorthand, abbreviations, imperfect style, missing jargon, or failure to follow a requested sentence/word count.",
          "Mark incorrect only for a genuine factual/conceptual error, a response that does not address the question, or omission of substance indispensable to the actual task.",
          "",
          "Write a neutral 1-3 sentence explanation. `evidence` must quote or closely identify the substance in the student's answer that supports the verdict. Set confidence from 0 to 1.",
          'Output strict JSON {"correct": boolean, "explanation": string, "confidence": number, "evidence": string[]}.',
        ].join("\n"),
        JSON.stringify({
          question_asked: opts.prompt,
          reference_answer: correct,
          student_answer: user,
        }),
      );
      return {
        correct: !!out.correct,
        explanation:
          out.explanation ||
          (out.correct
            ? "The response demonstrates the required understanding."
            : "The response does not yet supply the substance the question asks for."),
        confidence:
          typeof out.confidence === "number"
            ? Math.max(0, Math.min(1, out.confidence))
            : 0.75,
        evidence: Array.isArray(out.evidence)
          ? out.evidence.filter((item) => typeof item === "string").slice(0, 4)
          : [],
      };
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : "unknown grader error";
  throw new Error(
    `The grader is temporarily unavailable, so this answer was not marked wrong. Please submit again. (${message})`,
  );
}

// Rich, coaching-style feedback for PRACTICE assignments. Unlike gradeAnswer
// (which returns a terse 1-3 sentence verdict for graded work), this returns
// generous, structured feedback designed to help a student improve before they
// sit the real graded version. Practice is never penalized, so feedback leans
// encouraging and specific.
export async function gradePracticeEssay(opts: {
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
}): Promise<{ correct: boolean; feedback: string }> {
  const user = (opts.userAnswer ?? "").trim();
  const correct = opts.correctAnswer ?? "";

  if (!user) {
    return {
      correct: false,
      feedback: `You left this one blank. Give it a real attempt — even a rough draft — and resubmit for feedback.\n\n**Model answer:** ${correct}`,
    };
  }

  try {
    const out = await chatJson<{
      correct: boolean;
      feedback: string;
    }>(
      [
        "You are a warm, rigorous prompt-engineering tutor giving feedback on a PRACTICE answer (never penalized — the goal is to help the student improve before the real graded version).",
        "",
        "Decide `correct` by whether the student's answer is ACTUALLY CORRECT on the merits, using your own expert knowledge of prompt engineering — not by similarity to any reference. A `reference_answer` is provided, but it is only a FALLIBLE HINT from the course materials: it may be incomplete, narrow, or simply WRONG, and is NOT ground truth. If the student is actually correct but differs from or contradicts the reference, mark `correct` = true; if the reference is wrong, ignore it.",
        "",
        "Work out what the question actually asks for, then mark `correct` = true if the student genuinely supplies a correct answer. Accept paraphrases, different wording, different examples, and equivalent reasoning. If two answers do not differ in substance they get the same result.",
        "",
        "NEVER lower `correct` for grammar, spelling, capitalization (ALL CAPS is fine), sentence fragments, notes, bullet points, shorthand, abbreviations, incomplete sentences, or for not following formatting/length instructions. Only correctness of content matters — never form or obedience.",
        "",
        "Then write `feedback` as encouraging Markdown with these sections: **What you got right** (be specific, cite their wording), **What's missing or off** (only genuine errors or gaps that make the answer actually wrong — never nitpick form, grammar, or divergence from the reference when the student is correct), and **How to strengthen it** (1-2 concrete next steps). 4-8 sentences total, neutral and supportive in tone — never snippy.",
        "",
        "For any math expressions in feedback use \\(...\\) for inline math and \\[...\\] for display math. For currency amounts write the dollar sign as \\$ (e.g. \\$3) — never use a bare $ for currency.",
        "",
        'Output strict JSON {"correct": boolean, "feedback": string}.',
      ].join("\n"),
      JSON.stringify({
        question_asked: opts.prompt,
        reference_answer: correct,
        student_answer: user,
      }),
    );
    return {
      correct: !!out.correct,
      feedback:
        out.feedback ||
        `Here's the model answer to compare against:\n\n${correct}`,
    };
  } catch {
    return {
      correct: false,
      feedback: `I couldn't reach the grader just now. Compare your answer against the model answer and try again:\n\n**Model answer:** ${correct}`,
    };
  }
}
