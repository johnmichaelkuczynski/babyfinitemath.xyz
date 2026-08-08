import {
  BarChart3,
  BookOpen,
  MessagesSquare,
  Target,
  ClipboardCheck,
  ShieldCheck,
  Search,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const features = [
  {
    icon: BookOpen,
    title: "Three-Depth Lessons",
    body: "Read any topic Short, Medium, or Long — same ideas, your pace.",
  },
  {
    icon: MessagesSquare,
    title: "Section-Scoped Tutor",
    body: "Ask about the exact passage you're on and get a live, grounded answer.",
  },
  {
    icon: Target,
    title: "Adaptive Practice",
    body: "Questions that get harder on a streak and ease off after a miss.",
  },
  {
    icon: ClipboardCheck,
    title: "AI-Graded Work",
    body: "Weekly homework, a timed midterm, and a cumulative final — each with written feedback.",
  },
  {
    icon: ShieldCheck,
    title: "Built-In Integrity",
    body: "Every submission is screened for AI authorship, with a clear verdict.",
  },
  {
    icon: BarChart3,
    title: "Four Weeks, 28 Topics",
    body: "From what prompt engineering is all the way to shipping a real AI feature.",
  },
];

const weeks = [
  {
    n: 1,
    title: "Foundations: how models respond to prompts",
    topics: [
      { n: "1.1", title: "What prompt engineering is (and why it works)" },
      { n: "1.2", title: "How language models read and continue text" },
      { n: "1.3", title: "Anatomy of a prompt: instruction, context, input, output" },
      { n: "1.4", title: "Being specific: clarity, detail, and constraints" },
      { n: "1.5", title: "Setting role and tone (system vs. user framing)" },
      { n: "1.6", title: "Controlling format and length" },
      { n: "1.7", title: "Common failure modes and how to spot them" },
    ],
  },
  {
    n: 2,
    title: "Core techniques",
    topics: [
      { n: "2.1", title: "Zero-shot vs. few-shot prompting" },
      { n: "2.2", title: "Writing good examples (and why bad ones hurt)" },
      { n: "2.3", title: "Chain-of-thought: asking for reasoning" },
      { n: "2.4", title: "Decomposition: breaking big tasks into steps" },
      { n: "2.5", title: "Giving the model context and reference material" },
      { n: "2.6", title: "Using delimiters and structure (XML, markdown, JSON)" },
      { n: "2.7", title: "Iterating: how to debug and refine a prompt" },
    ],
  },
  {
    n: 3,
    title: "Advanced patterns and reliability",
    topics: [
      { n: "3.1", title: "Getting structured output (JSON and schemas)" },
      { n: "3.2", title: "Prompt chaining: linking multiple calls" },
      { n: "3.3", title: "Self-critique and revision prompts" },
      { n: "3.4", title: "Grounding with retrieval (RAG in plain terms)" },
      { n: "3.5", title: "Tool use and function calling" },
      { n: "3.6", title: "Controlling randomness: temperature and sampling" },
      { n: "3.7", title: "Consistency, evaluation, and testing prompts" },
    ],
  },
  {
    n: 4,
    title: "Applications, safety, and building systems",
    topics: [
      { n: "4.1", title: "Prompts for writing, summarizing, and extraction" },
      { n: "4.2", title: "Prompts for coding and data tasks" },
      { n: "4.3", title: "Prompts for analysis and decision support" },
      { n: "4.4", title: "Prompt injection and security risks" },
      { n: "4.5", title: "Reducing hallucination and bias" },
      { n: "4.6", title: "Building reusable prompt templates" },
      { n: "4.7", title: "From prompt to product: designing an AI feature" },
    ],
  },
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            <Search className="w-4 h-4" />
          </div>
          <span className="font-serif font-semibold text-lg tracking-tight">
            Prompt Engineering
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href={`${basePath}/api/auth/google`}>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors"
              data-testid="button-sign-in"
            >
              Sign in
            </button>
          </a>
          <a href={`${basePath}/api/auth/google`}>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              data-testid="button-sign-up"
            >
              Get started
            </button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
            <BarChart3 className="w-3.5 h-3.5" />
            A complete, four-week course in prompt engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary leading-tight mb-5">
            Learn to write prompts that get the results you want. Let's build the skill together.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A self-paced course that teaches, tutors, drills, and grades you —
            prompt engineering in plain language, built from first principles,
            every idea explained clearly and shown at work. Written for adults
            learning to get reliable results from language models.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href={`${basePath}/api/auth/google`}>
              <button
                className="px-6 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                data-testid="button-cta-start"
              >
                Sign in with Google to start
              </button>
            </a>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-primary">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-24">
          <h2 className="text-center font-serif font-semibold text-xl mb-6">
            The Curriculum
          </h2>
          <div className="flex flex-col gap-6">
            {weeks.map((w) => (
              <div
                key={w.n}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm">
                    {w.n}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Week {w.n}
                    </div>
                    <div className="font-serif font-semibold text-lg">
                      {w.title}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {w.topics.map((t) => (
                    <div key={t.n} className="flex items-start gap-3">
                      <span className="text-xs font-bold text-primary tabular-nums mt-0.5 w-7 shrink-0">
                        {t.n}
                      </span>
                      <span className="text-sm">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        Prompt Engineering — where the curriculum, the tutor, the grader, and the
        integrity check all live in one room.
      </footer>
    </div>
  );
}
