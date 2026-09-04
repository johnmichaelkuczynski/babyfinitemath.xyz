import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { 
  useGetAssignment, 
  useStartAssignmentAttempt, 
  useGetAttempt, 
  useSaveAnswer, 
  useSubmitAttempt,
  AttemptResult,
  KeystrokeTrace
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnswerInput } from "@/components/AnswerInput";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { isAdminMode } from "@/lib/adminMode";

type MultipleChoiceQuestion = {
  stem: string;
  options: Array<{ label: string; value: string }>;
};

function parseMultipleChoice(prompt: string): MultipleChoiceQuestion | null {
  const lines = prompt.split("\n");
  if (lines[0]?.trim() !== "[MULTIPLE_CHOICE]") return null;
  const optionStart = lines.findIndex((line, index) => index > 0 && /^[A-D]\)\s+/.test(line));
  if (optionStart < 0) return null;
  const options = lines.slice(optionStart).flatMap((line) => {
    const match = line.match(/^([A-D])\)\s+(.+)$/);
    return match ? [{ label: match[1]!, value: match[2]!.trim() }] : [];
  });
  return {
    stem: lines.slice(1, optionStart).join("\n").trim(),
    options,
  };
}

export default function AssignmentRunner() {
  const params = useParams();
  const assignmentId = Number(params.id);
  
  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignment(assignmentId);
  const startAttempt = useStartAssignmentAttempt();
  const submitAttempt = useSubmitAttempt();
  
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const { data: attempt, refetch: refetchAttempt } = useGetAttempt(attemptId || 0, {
    query: { enabled: !!attemptId, queryKey: ['attempt', attemptId] }
  });
  
  const saveAnswer = useSaveAnswer();

  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const answersRef = useRef<Record<number, string>>({});
  const tracesRef = useRef<Record<number, KeystrokeTrace>>({});
  const saveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const saveChainsRef = useRef<Record<number, Promise<void>>>({});

  useEffect(() => {
    if (assignmentId && !attemptId && !startAttempt.isPending && !result) {
      startAttempt.mutate({ assignmentId }, {
        onSuccess: (data) => {
          setAttemptId(data.id);
          const initialAnswers: Record<number, string> = {};
          data.answers.forEach(a => {
            initialAnswers[a.problemId] = a.answer;
          });
          answersRef.current = initialAnswers;
          setAnswers(initialAnswers);
        }
      });
    }
  }, [assignmentId, attemptId, startAttempt, result]);

  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  function persistLatestAnswer(problemId: number): Promise<void> {
    if (!attemptId) return Promise.resolve();
    const previous = saveChainsRef.current[problemId] ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        await saveAnswer.mutateAsync({
          attemptId,
          data: {
            problemId,
            answer: answersRef.current[problemId] ?? "",
            trace: tracesRef.current[problemId] ?? {
              keystrokeCount: 0,
              eraseCount: 0,
              bulkInsertCount: 0,
              longestBulkInsertChars: 0,
              rewriteSegments: 0,
              durationMs: 0,
            },
          },
        });
      });
    saveChainsRef.current[problemId] = next;
    return next;
  }

  function scheduleAnswerSave(problemId: number) {
    clearTimeout(saveTimersRef.current[problemId]);
    saveTimersRef.current[problemId] = setTimeout(() => {
      void persistLatestAnswer(problemId);
    }, 600);
  }

  const handleAnswerChange = (problemId: number, val: string, trace: KeystrokeTrace) => {
    answersRef.current[problemId] = val;
    tracesRef.current[problemId] = trace;
    setAnswers(prev => ({ ...prev, [problemId]: val }));
    scheduleAnswerSave(problemId);
  };

  const handleSubmit = async () => {
    if (!attemptId || !assignment) return;
    const unanswered = assignment.problems.filter(
      (problem) => !(answersRef.current[problem.id] ?? "").trim(),
    );
    if (unanswered.length > 0) {
      setSubmitError(`Answer every question before submitting. ${unanswered.length} still ${unanswered.length === 1 ? "needs" : "need"} a response.`);
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await Promise.all(
        assignment.problems.map((problem) => {
          clearTimeout(saveTimersRef.current[problem.id]);
          return persistLatestAnswer(problem.id);
        }),
      );
      const data = await submitAttempt.mutateAsync({
        attemptId,
        data: { skipDetection: isAdminMode() },
      });
      setResult(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The answer could not be saved or graded. Nothing was submitted; please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAssignment || !assignment) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">{assignment.title} - Results</h1>
              <p className="text-muted-foreground">Score: {result.percent}% ({result.score}/{result.total})</p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/assignments`}>Back to Assignments</Link>
            </Button>
          </div>
          
          <div className="flex flex-col gap-6">
            {result.perProblem.map((pr, idx) => (
              <div key={pr.problemId} className={`p-6 rounded-lg border ${pr.correct ? 'border-chart-2/50 bg-chart-2/5' : 'border-destructive/50 bg-destructive/5'}`}>
                <h3 className="font-medium mb-2">Problem {idx + 1}</h3>
                <div className="mb-4">
                  <span className="text-sm font-semibold">Your Answer:</span>
                  <div className="font-mono mt-1">{pr.userAnswer || "No answer"}</div>
                </div>
                {!pr.correct && pr.correctAnswer && (
                  <div className="mb-4 text-primary">
                    <span className="text-sm font-semibold">Correct Answer:</span>
                    <div className="font-mono mt-1">{pr.correctAnswer}</div>
                  </div>
                )}
                <div>
                  <span className="text-sm font-semibold">Explanation:</span>
                  <div className="mt-1 text-sm"><MarkdownRenderer content={pr.explanation} /></div>
                </div>
                
                {/* AI Flags */}
                {result.detection.find(d => d.problemId === pr.problemId)?.aiFlagged && (
                  <div className="mt-4 p-3 bg-secondary rounded-md text-sm border border-secondary-border">
                    <strong className="text-chart-4">Flagged content accepted — no penalty during initial phase.</strong>
                    <p className="text-muted-foreground mt-1">{result.detection.find(d => d.problemId === pr.problemId)?.rationale}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const currentProblem = assignment.problems[currentProblemIdx];
  const multipleChoice = currentProblem
    ? parseMultipleChoice(currentProblem.prompt)
    : null;

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 pb-24">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">{assignment.title}</h1>
            <p className="text-sm text-muted-foreground">Problem {currentProblemIdx + 1} of {assignment.problems.length}</p>
          </div>
          {attempt?.deadlineAt && (
            <div className="text-destructive font-mono font-bold px-3 py-1 rounded bg-destructive/10 border border-destructive/20">
              Deadline: {new Date(attempt.deadlineAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-chart-2/40 bg-chart-2/5 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-foreground">
            <strong>This is the graded {assignment.kind} — the tutor is off and your work is scored.</strong>{" "}
            Want to warm up first? Run an unlimited practice version that gives
            feedback and keeps the tutor with you.
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href={`/assignments/${assignmentId}/practice`}>
              ✨ Practice this first
            </Link>
          </Button>
        </div>

        {assignment.instructions && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm whitespace-pre-line">
            {assignment.instructions}
          </div>
        )}

        {currentProblem ? (
          <div className="flex flex-col gap-8">
            <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
              <MarkdownRenderer content={multipleChoice?.stem ?? currentProblem.prompt} />
            </div>
            
            <div className="flex flex-col gap-4">
              {multipleChoice ? (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold">Choose the best answer</legend>
                  {multipleChoice.options.map((option) => {
                    const selected = answers[currentProblem.id] === option.value;
                    return (
                      <label
                        key={option.label}
                        className={`flex gap-3 rounded-lg border p-4 cursor-pointer ${
                          selected ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`problem-${currentProblem.id}`}
                          value={option.value}
                          checked={selected}
                          onChange={() =>
                            handleAnswerChange(currentProblem.id, option.value, {
                              keystrokeCount: option.value.length,
                              eraseCount: 0,
                              bulkInsertCount: 0,
                              longestBulkInsertChars: 0,
                              rewriteSegments: 0,
                              durationMs: 0,
                            })
                          }
                          className="mt-1"
                        />
                        <span>
                          <strong className="mr-2">{option.label}.</strong>
                          {option.value}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              ) : (
                <AnswerInput 
                  value={answers[currentProblem.id] || ""}
                  label={`Answer to Problem ${currentProblemIdx + 1}`}
                  allowPaste
                  onChange={(val, trace) => handleAnswerChange(currentProblem.id, val, trace)}
                />
              )}
            </div>

            {submitError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setCurrentProblemIdx(p => Math.max(0, p - 1))}
                disabled={currentProblemIdx === 0}
              >
                Previous
              </Button>
              
              {currentProblemIdx < assignment.problems.length - 1 ? (
                <Button 
                  onClick={() => setCurrentProblemIdx(p => Math.min(assignment.problems.length - 1, p + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-chart-2 hover:bg-chart-2/90 text-white"
                  disabled={isSubmitting || submitAttempt.isPending}
                >
                  {isSubmitting || submitAttempt.isPending ? "Saving and grading..." : "Submit Assignment"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>Problem not found.</div>
        )}
      </div>
    </Layout>
  );
}
