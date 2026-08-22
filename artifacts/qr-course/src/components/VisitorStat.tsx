import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface VisitorStats {
  uniqueVisitors: number;
  totalVisits: number;
}

/** Course-wide anonymous visitor totals. The app has no account system. */
export function VisitorStat() {
  const { data } = useQuery({
    queryKey: ["visitor-stats"],
    staleTime: 60_000,
    queryFn: async (): Promise<VisitorStats | null> => {
      const res = await fetch(`${basePath}/api/admin/visitors`);
      return res.ok ? ((await res.json()) as VisitorStats) : null;
    },
  });

  if (!data) return null;

  return (
    <Card data-testid="card-visitor-stat">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-primary shrink-0">
          <Users className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="text-sm">
          <span className="font-medium text-foreground">
            Unique visitors: {data.uniqueVisitors}
          </span>{" "}
          <span className="text-muted-foreground">
            ({data.totalVisits} total visits)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}