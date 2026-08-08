# 🔎 Prompt Engineering

**A Complete, Four-Week Introduction to Prompt Engineering That Teaches, Tutors, Drills, Grades, and Proofs Itself — for Adults Beginning the Discipline**

---

## 🧩 Overview

Prompt Engineering is a self-paced, single-user web course that delivers a thorough, plain-language introduction to prompt engineering — the craft of designing instructions that make language models produce accurate, consistent, useful output — taught, tutored, drilled, and graded entirely by AI, with built-in academic-integrity enforcement. It assumes no prior background in the subject and develops every idea from first principles in plain words rather than jargon.

It turns the everyday questions of working with language models — *why did the model answer that way, how do I ask so it answers well, and how do I make it reliable* — into one product: read each lesson at the depth you want, ask a tutor scoped to the exact section you're on, drill questions whose difficulty adapts to you in real time, and submit homework, a midterm, and a final that are AI-graded with feedback and screened for AI-generated answers. The material is kept approachable and concrete — from the anatomy of a clear instruction to few-shot examples, chain-of-thought, structured output, retrieval grounding, tool use, prompt injection, and designing a real AI feature.

The curriculum is organized into **four weeks and 28 topics**: Week 1 — Foundations: how models respond to prompts (what prompt engineering is, how models read and continue text, anatomy of a prompt, being specific, role and tone, format and length, failure modes); Week 2 — Core techniques (zero-shot vs. few-shot, writing good examples, chain-of-thought, decomposition, context and reference material, delimiters and structure, iterating and debugging); Week 3 — Advanced patterns and reliability (structured output, prompt chaining, self-critique, grounding with retrieval, tool use and function calling, temperature and sampling, evaluation and testing); Week 4 — Applications, safety, and building systems (writing/summarizing/extraction, coding and data tasks, analysis and decision support, prompt injection, hallucination and bias, reusable templates, from prompt to product).

Designed for **adults beginning prompt engineering — including graduate students, researchers, and professionals bringing language models into their work — as well as instructors evaluating AI-taught coursework and researchers studying AI academic integrity**, Prompt Engineering pairs a real curriculum with two layers of AI-authorship detection — surfacing not just *whether* the writing looks AI-generated, but whether the *act of producing it* did.

---

## 🧠 What It Does

- **Four-Week Structured Curriculum** — A complete plain-language intro syllabus across 28 topics, from "what prompt engineering is" to designing a production AI feature. The course ships with lessons, four weekly homework sets, a timed midterm, and a cumulative final exam.
- **Three-Depth Lessons** — Every lesson is available at **Short / Medium / Long** length, AI-rewritten while preserving the same examples and learning objectives. Skim the concept, expand it on demand, or read the deeper cut.
- **Section-Scoped AI Tutor** — Ask a question about the paragraph you're reading and the answer streams back token-by-token, grounded in that exact lecture section. Suggested starter questions are pre-generated per lecture.
- **Adaptive Topic Practice** — Generated problem sets that move difficulty up after a streak and down after a miss, with explanations on every answer. Per-session difficulty persists, so each drill picks up where the last one left off.
- **AI-Graded Assignments** — Weekly homework, the midterm, and the final are scored by an LLM grader that judges semantic equivalence to a model answer, returns per-problem correctness *plus* a written rationale, then rolls up to a percent score on the attempt.
- **Two-Layer AI Detection on Every Submission** — Each submitted answer is screened by both a static text classifier (GPTZero) and a diachronic keystroke-pattern detector. Each verdict ships with a human-readable rationale.
- **Diagnostic Reasoning Checks** — Two instruments (Prompt Engineering subject reasoning; and General Reasoning across analysis, inference, evaluation, deduction, and induction), each offered in three formats (multiple choice, hybrid, or written) and three lengths, at four points in the journey (before, one-third, two-thirds, and after the course). They are ungraded practice — takeable anytime, unlimited, with freshly generated questions every attempt — and never affect the grade (coursework is 100%).
- **Live Analytics** — Dashboard KPIs (attempts, accuracy, streak), per-topic mastery percentages, and a recent-activity feed — so progress, weak spots, and momentum are all visible at a glance.
- **Operator Diagnostics** — One-click self-tests (system health and synthetic-student end-to-end run) verify the entire stack — database, OpenAI integration, GPTZero, detection pipeline, and the practice/grade loop — before you trust a session.

---

## ⚙️ Technical Features

- **Two-Layer AI-Authorship Detection** —
  - **Static (GPTZero):** Every submitted answer is sent to GPTZero's `predict/text` endpoint; the per-document AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic` for the final score. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic — submissions never block.
  - **Diachronic (Keystroke Pattern):** The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration. A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds — catching AI use even when the final text is reworded enough to pass GPTZero.
- **Diagnostic Self-Tests** —
  - **System Diagnostic** (`/diagnostics/system`): Ordered checks — environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, AI-positive control sample, and GPTZero connectivity. Each step returns pass/fail, timing, and a raw error string.
  - **Synthetic-Student Diagnostic** (`/diagnostics/synthetic-run`): Spins up a fake student, runs a practice session (wrong → adjust ↓ → right → adjust ↑), takes a full assignment attempt, submits it, and verifies grading + detection + analytics all reflect the run. End-to-end stack proof in one click.
- **Contract-First API** — A single OpenAPI document is the source of truth; React Query hooks for the UI and Zod validators for the server are generated from it. Request and response shapes can't drift between client and server because both come from the same spec.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming for tutor answers, with a section-scoped system prompt so responses stay grounded in the lecture the student is reading.
- **Adaptive Practice Engine** — Per-session difficulty (1–4 continuous) adjusts after each attempt; the next-problem generator takes the current difficulty and the topic as input, so the question pool is generated on demand instead of pre-baked.
- **Operator Console** — A dedicated Diagnostics page in the student app surfaces both self-tests with one-click execution, per-step pass/fail rows, and raw error output for debugging.
- **Living README** — This README plus a companion `BLUEPRINT.md` architecture document are kept in lock-step with the code — short-form and long-form views of the same truth.

---

## 📊 Designed For

- **Newcomers to the discipline:** A complete, plain-language introduction to prompt engineering delivered with on-demand tutoring and adaptive practice — self-contained and assuming no prior background, with no instructor required.
- **Instructors & Curriculum Designers:** A working reference for what AI-taught, AI-graded, AI-detection-screened coursework actually looks like end-to-end.
- **Academic-Integrity Researchers:** A live testbed for layered AI-authorship detection that combines text-based classification with behavioral keystroke evidence.
- **Product & Engineering Teams:** A reference implementation of contract-first full-stack architecture, streaming AI UX, and self-diagnostic operator tooling in a Replit pnpm monorepo.

---

## 💡 Core Idea

Prompt Engineering reframes an AI-taught course as a *closed accountability loop*.

It doesn't just teach the material and grade the homework — it **teaches**, **tutors**, **drills**, **grades**, **detects misuse**, and **proves the whole pipeline still works** with a single click. The result is a self-paced course that students can actually trust to be fair, and that instructors can actually trust to be honest.

**Prompt Engineering — where the curriculum, the tutor, the grader, and the integrity check all live in one room.**

---

## 👤 User preferences

- The user prefers to **convert the existing app in place** (e.g. replacing the prior course content/branding with the new subject) rather than create a standalone clone — keep all functionality and format intact when making content/branding changes.
- **Audience & tone:** This is a serious, substantial course for **adults** — typically people beginning a new discipline (often graduate students or professors). It is **never** for children. The words **"baby"** and **"children"** (and "kids", "middle schoolers", "kid-friendly", etc.) must **never** appear in the app, README, video, or YouTube description — the only exception is when the course's actual subject matter is about children/babies (e.g. developmental psychology). Never describe the course in a goofy, cute, or condescending way, and never lead with belittling hooks like "No math!" or "kid-friendly". Marketing copy should foreground the **depth and wealth of the content**.
- **App naming:** The app/course must always have the most literal, utilitarian name possible (e.g. "Data Analytics", "Ethics", "Formal Logic", "Basic AI") — never a cute, funny, or goofy name. If a name is "Baby X", rename it "Basic X"; if it is "X for Children", rename it "Basic X". A "Basic" qualifier is acceptable (the course is basic), but it is still for adults.
- **YouTube description title format:** The app title in the YouTube description must always be exactly `X — AI-Powered Course` (e.g. "Basic Finite Math — AI-Powered Course", "Evolutionary Psychology — AI-Powered Course"). Do not append any descriptors or taglines to that title line.
