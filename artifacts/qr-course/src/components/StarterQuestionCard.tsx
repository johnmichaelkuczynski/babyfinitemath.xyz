import { useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { MathKeyboard, insertAtTextareaCursor } from "@/components/MathKeyboard";

interface Props {
  index: number;
  question: string;
  pending: boolean;
  /** Returns the tutor's feedback text as a Promise so we can show it inline. */
  onSubmitAttempt: (attempt: string) => Promise<string>;
  onShowAnswer: () => void;
  onDismiss: () => void;
}

export function StarterQuestionCard({
  index,
  question,
  pending,
  onSubmitAttempt,
  onShowAnswer,
  onDismiss,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  async function submit() {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const reply = await onSubmitAttempt(value);
      setFeedback(reply);
      setValue("");
      // Keep the card open so the user can read the feedback.
    } catch {
      setFeedback("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleMathInsert(text: string, cursorBack = 0) {
    const el = taRef.current;
    if (!el) return;
    const { value: newVal, cursor } = insertAtTextareaCursor(el, text, cursorBack);
    setValue(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function reset() {
    setFeedback(null);
    setValue("");
    setOpen(false);
  }

  return (
    <div className="group rounded-md border border-border bg-background/40 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-2 p-2">
        <div className="flex-1 text-sm leading-snug" data-testid={`suggestion-${index}`}>
          <MarkdownRenderer content={question} />
        </div>
        <button
          onClick={onDismiss}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1 -mt-1"
          title="Dismiss this question"
          data-testid={`button-dismiss-suggestion-${index}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!feedback && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <button
            onClick={() => { setOpen((v) => !v); setFeedback(null); }}
            disabled={pending || submitting}
            className="text-xs font-medium px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            data-testid={`button-try-suggestion-${index}`}
          >
            {open ? "Cancel" : "Try answering"}
          </button>
          <button
            onClick={onShowAnswer}
            disabled={pending || submitting}
            className="text-xs font-medium px-2 py-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-50"
            data-testid={`button-show-suggestion-${index}`}
          >
            Just show me the answer
          </button>
        </div>
      )}

      {open && !feedback && (
        <div className="px-2 pb-2 flex flex-col gap-2">
          <label htmlFor={`starter-answer-${index}`} className="sr-only">
            Answer to starter question {index + 1}
          </label>
          <textarea
            id={`starter-answer-${index}`}
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type your answer…"
            rows={3}
            disabled={submitting}
            className="bg-secondary border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[72px] disabled:opacity-60"
            data-testid={`input-attempt-${index}`}
            autoFocus
          />
          <MathKeyboard onInsert={handleMathInsert} />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={submit}
              disabled={!value.trim() || submitting}
              data-testid={`button-submit-attempt-${index}`}
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 mr-1 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                  Checking…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Check my answer
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Inline feedback — shown after the tutor replies */}
      {feedback && (
        <div className="px-2 pb-3 flex flex-col gap-2">
          <div className="rounded-md bg-secondary border border-border p-3 text-sm">
            <MarkdownRenderer content={feedback} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFeedback(null); setOpen(true); }}
              className="text-xs font-medium px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid={`button-try-again-${index}`}
            >
              Try again
            </button>
            <button
              onClick={reset}
              className="text-xs font-medium px-2 py-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground"
              data-testid={`button-done-suggestion-${index}`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
