export interface NarrationCue {
  start: number;
  end: number;
  text: string;
}

/**
 * The public walkthrough's narration is also available as timed text. Keeping
 * these cues beside the player makes the visual caption and downloadable VTT
 * track share one source of truth.
 */
export const NARRATION_CUES: NarrationCue[] = [
  {
    start: 0,
    end: 6.8,
    text: "Master how to steer AI models with a complete, adult-level Prompt Engineering course. It is taught, tutored, drilled, and graded entirely by AI.",
  },
  {
    start: 6.8,
    end: 11.4,
    text: "The dashboard gives learners a clear view of assignments, practice problems, their current module, and recent activity.",
  },
  {
    start: 11.4,
    end: 16.4,
    text: "The curriculum covers four weeks and twenty-eight topics, from foundations and core techniques to advanced patterns, applications, and safety.",
  },
  {
    start: 16.4,
    end: 21.4,
    text: "Lessons are available in short, medium, and long versions. For example, a few-shot prompting lesson explains how examples guide a model toward the pattern you need.",
  },
  {
    start: 21.4,
    end: 28.2,
    text: "When learners have a question, the section-scoped tutor uses the passage they are reading. It can explain why a model adds conversational filler even when JSON was requested.",
  },
  {
    start: 28.2,
    end: 33.7,
    text: "Adaptive practice asks learners to explain their reasoning, gives feedback, and adjusts difficulty as they build a streak.",
  },
  {
    start: 33.7,
    end: 40.4,
    text: "Assignments are graded with written rationale. Learners can see their score, understand the concepts they demonstrated, and review an authorship check.",
  },
  {
    start: 40.4,
    end: 44.9,
    text: "Performance analytics show course progress, practice accuracy, attempts, streaks, and the topics that need more work.",
  },
  {
    start: 44.9,
    end: 50.94,
    text: "Prompt Engineering brings the curriculum, the tutor, the grader, and the integrity check together in one room.",
  },
];

export function getNarrationCue(currentTime: number): NarrationCue | undefined {
  return NARRATION_CUES.find(
    (cue) => currentTime >= cue.start && currentTime < cue.end,
  );
}