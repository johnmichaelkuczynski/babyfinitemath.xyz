import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const OWNER_EMAIL = "johnmichaelkuczynski@gmail.com";

interface VisitorStats {
  uniqueVisitors: number;
  totalVisits: number;
}

/**
 * Owner-only visitor stat. Renders nothing for anyone but the owner login and
 * silently swallows 403s (in case the session lapses or the owner is spoofing).
 */
export function VisitorStat() {
  const { user } = useAuth();
  const isOwner =
    (user?.email ?? "").toLowerCase() === OWNER_EMAIL.toLowerCase();

  const { data } = useQuery({
    queryKey: ["admin-visitors"],
    enabled: isOwner,
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<VisitorStats | null> => {
      const res = await fetch(`${basePath}/api/admin/visitors`, {
        credentials: "include",
      });
      if (!res.ok) return null; // swallow 403 (and any other failure) silently
      return (await res.json()) as VisitorStats;
    },
  });

  if (!isOwner || !data) return null;

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
