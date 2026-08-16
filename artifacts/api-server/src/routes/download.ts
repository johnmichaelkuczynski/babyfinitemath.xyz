import { Router, type IRouter } from "express";
import { and, asc, eq, inArray, notLike } from "drizzle-orm";
import {
  db,
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import PDFDocument from "pdfkit";

const router: IRouter = Router();

const COURSE_TITLE = "Prompt Engineering";

// Lightweight Markdown -> plain text for readable export. Strips heading
// markers, bold/italic emphasis, inline code fences, and list bullets while
// preserving the text and paragraph structure.
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```/g, "").trim(),
    ) // fenced code -> bare text
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ") // bullet lists
    .replace(/^\s*>\s?/gm, "") // blockquotes
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> label
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface Lesson {
  title: string;
  body: string;
}

interface PracticeSection {
  title: string;
  instructions: string;
  prompts: string[];
}

interface CourseDoc {
  lessons: Lesson[];
  practice: PracticeSection[];
}

// The two diagnostic primers are excluded from the exported course. They share
// weekNumber 1 with real week-1 topics but their slugs match "reasoning-primer-%".
async function buildCourseDoc(): Promise<CourseDoc> {
  const topics = await db
    .select({ id: topicsTable.id })
    .from(topicsTable)
    .where(notLike(topicsTable.slug, "reasoning-primer-%"))
    .orderBy(asc(topicsTable.position));
  const topicIds = topics.map((t) => t.id);

  const lectures = topicIds.length
    ? await db
        .select({
          title: lecturesTable.title,
          body: lecturesTable.body,
          topicId: lecturesTable.topicId,
        })
        .from(lecturesTable)
        .where(inArray(lecturesTable.topicId, topicIds))
    : [];
  const lectureByTopic = new Map(lectures.map((l) => [l.topicId, l]));

  const lessons: Lesson[] = [];
  for (const t of topics) {
    const lec = lectureByTopic.get(t.id);
    if (!lec) continue;
    lessons.push({ title: lec.title, body: stripMarkdown(lec.body) });
  }

  // Practice problems: Homework 1 (first homework by position), the Midterm,
  // and the Final. Prompts only — no answers, explanations, or hints.
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .where(
      inArray(assignmentsTable.kind, ["homework", "midterm", "final"]),
    )
    .orderBy(asc(assignmentsTable.position));

  const homework1 = assignments.find((a) => a.kind === "homework");
  const midterm = assignments.find((a) => a.kind === "midterm");
  const final = assignments.find((a) => a.kind === "final");
  const selected = [homework1, midterm, final].filter(
    (a): a is (typeof assignments)[number] => Boolean(a),
  );

  const practice: PracticeSection[] = [];
  for (const a of selected) {
    const probs = await db
      .select({ prompt: problemsTable.prompt })
      .from(problemsTable)
      .where(eq(problemsTable.assignmentId, a.id))
      .orderBy(asc(problemsTable.position));
    practice.push({
      title: a.title,
      instructions: a.instructions ? stripMarkdown(a.instructions) : "",
      prompts: probs.map((p) => stripMarkdown(p.prompt)),
    });
  }

  return { lessons, practice };
}

function renderTxt(doc: CourseDoc): string {
  const lines: string[] = [];
  lines.push(COURSE_TITLE);
  lines.push("=".repeat(COURSE_TITLE.length));
  lines.push("");

  for (const lesson of doc.lessons) {
    lines.push(lesson.title);
    lines.push("-".repeat(lesson.title.length));
    lines.push("");
    lines.push(lesson.body);
    lines.push("");
    lines.push("");
  }

  if (doc.practice.length > 0) {
    lines.push("Practice problems");
    lines.push("=================");
    lines.push("");
    for (const section of doc.practice) {
      lines.push(section.title);
      lines.push("-".repeat(section.title.length));
      lines.push("");
      if (section.instructions) {
        lines.push(section.instructions);
        lines.push("");
      }
      section.prompts.forEach((p, i) => {
        lines.push(`${i + 1}. ${p}`);
        lines.push("");
      });
      lines.push("");
    }
  }

  return lines.join("\n");
}

router.get("/course/download", async (req, res): Promise<void> => {
  const format = String(req.query.format ?? "txt").toLowerCase();
  if (format !== "txt" && format !== "pdf") {
    res.status(400).json({ error: "format must be txt or pdf" });
    return;
  }

  const doc = await buildCourseDoc();

  if (format === "txt") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="prompt-engineering-course.txt"',
    );
    res.send(renderTxt(doc));
    return;
  }

  // PDF: stream directly to the response so we never hold the whole document in
  // memory as one giant string.
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="prompt-engineering-course.pdf"',
  );

  const pdf = new PDFDocument({ size: "LETTER", margin: 64 });
  pdf.on("error", (err) => {
    console.error("PDF generation error:", err);
    if (!res.headersSent) res.status(500).end();
  });
  pdf.pipe(res);

  // Title page
  pdf.font("Helvetica-Bold").fontSize(28).text(COURSE_TITLE, { align: "center" });
  pdf.moveDown(0.5);
  pdf
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#444444")
    .text("Course reader", { align: "center" });
  pdf.fillColor("#000000");

  for (const lesson of doc.lessons) {
    pdf.addPage();
    pdf.font("Helvetica-Bold").fontSize(14).text(lesson.title);
    pdf.moveDown(0.5);
    pdf.font("Helvetica").fontSize(10.5).text(lesson.body, {
      align: "left",
      lineGap: 2,
    });
  }

  if (doc.practice.length > 0) {
    pdf.addPage();
    pdf.font("Helvetica-Bold").fontSize(20).text("Practice problems");
    pdf.moveDown(1);
    for (const section of doc.practice) {
      pdf.font("Helvetica-Bold").fontSize(14).text(section.title);
      pdf.moveDown(0.3);
      if (section.instructions) {
        pdf
          .font("Helvetica-Oblique")
          .fontSize(10.5)
          .text(section.instructions, { lineGap: 2 });
        pdf.moveDown(0.5);
      }
      pdf.font("Helvetica").fontSize(10.5);
      section.prompts.forEach((p, i) => {
        pdf.text(`${i + 1}. ${p}`, { lineGap: 2 });
        pdf.moveDown(0.4);
      });
      pdf.moveDown(0.8);
    }
  }

  pdf.end();
});

export default router;
