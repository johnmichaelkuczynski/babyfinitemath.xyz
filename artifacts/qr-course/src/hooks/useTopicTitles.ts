import { useGetCourseOverview } from "@workspace/api-client-react";

/**
 * Strip any leading meta-marker / numeric prefix from a lecture title.
 * Removes patterns like "1.1 ", "1.1. ", "1 ", "Week 1: ", "Unit 2 - ", etc.
 * so the rail shows clean, unnumbered topic titles.
 */
export function stripPrefix(title: string): string {
  return title
    .replace(/^\s*(week|unit|module|lesson|chapter)\s*\d+\s*[:.\-–—)]*\s*/i, "")
    .replace(/^\s*\d+(\.\d+)*\s*[:.\-–—)]*\s*/, "")
    .trim();
}

/**
 * Returns every lecture title in the course as a flat, unnumbered list.
 * Non-primer lectures come first (in course order); the two "Primer:"
 * lectures are moved to the end, matching the reference layout.
 */
export function useTopicTitles(): { titles: string[]; count: number; isLoading: boolean } {
  const { data, isLoading } = useGetCourseOverview();

  const all = (data?.weeks ?? [])
    .flatMap((w) => w.lectures ?? [])
    .map((l) => ({ raw: l.title, clean: stripPrefix(l.title) }));

  const primers = all.filter((t) => /^primer\b/i.test(t.clean) || /primer/i.test(t.raw));
  const primerSet = new Set(primers.map((p) => p.raw));
  const nonPrimers = all.filter((t) => !primerSet.has(t.raw));

  const titles = [...nonPrimers, ...primers].map((t) => t.clean);

  return { titles, count: titles.length, isLoading };
}
