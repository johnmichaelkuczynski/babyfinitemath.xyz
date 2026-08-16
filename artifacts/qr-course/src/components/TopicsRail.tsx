import { Download } from "lucide-react";
import { useTopicTitles } from "@/hooks/useTopicTitles";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * A slim left-column rail listing every topic covered in the course, plus a
 * "Download Course" affordance. Rendered on the Landing and Dashboard pages.
 * Titles carry no meta-markers (no week/unit/numbering) — see useTopicTitles.
 */
export function TopicsRail({ className = "" }: { className?: string }) {
  const { titles, count, isLoading } = useTopicTitles();

  return (
    <aside
      className={`text-left ${className}`}
      aria-label="Topics covered in this course"
      data-testid="topics-rail"
    >
      <h2 className="font-serif font-semibold text-sm text-foreground leading-snug">
        Topics Covered in This Course
      </h2>
      <p className="text-xs text-muted-foreground mb-3" data-testid="text-topic-count">
        {isLoading ? "…" : `${count} topics`}
      </p>

      <ul className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-3 w-full rounded bg-muted animate-pulse" />
            ))
          : titles.map((title, i) => (
              <li
                key={`${title}-${i}`}
                className="text-xs text-muted-foreground leading-snug"
                data-testid={`text-topic-${i}`}
              >
                {title}
              </li>
            ))}
      </ul>

      <div className="mt-5">
        <a
          href={`${basePath}/api/course/download?format=pdf`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          data-testid="link-download-pdf"
        >
          <Download className="w-3.5 h-3.5" />
          Download Course (PDF)
        </a>
        <div className="mt-1 text-xs text-muted-foreground">
          <a
            href={`${basePath}/api/course/download?format=txt`}
            className="underline hover:text-foreground transition-colors"
            data-testid="link-download-txt"
          >
            or TXT
          </a>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-snug">
          Every lecture (short version) plus practice homework and exam problems.
        </p>
      </div>
    </aside>
  );
}
