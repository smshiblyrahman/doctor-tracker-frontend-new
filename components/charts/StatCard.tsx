import { memo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value?: string;
  icon: LucideIcon;
  /** Month-over-month change; null = no baseline. */
  trendPct?: number | null;
  footer?: ReactNode;
  isLoading?: boolean;
}

/** KPI tile in the style of dashboard-01's section cards. */
export const StatCard = memo(function StatCard({ label, value, icon: Icon, trendPct, footer, isLoading }: StatCardProps) {
  const up = (trendPct ?? 0) >= 0;
  return (
    <Card className="@container/card gap-3 bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? <Skeleton className="h-9 w-24" /> : value}
        </CardTitle>
        {trendPct !== undefined && trendPct !== null && !isLoading && (
          <CardAction>
            <Badge
              variant="outline"
              className={cn("gap-1 tabular-nums", up ? "text-success" : "text-destructive")}
              aria-label={`${up ? "Up" : "Down"} ${Math.abs(trendPct)}% versus last month`}
            >
              {up ? <TrendingUp aria-hidden /> : <TrendingDown aria-hidden />}
              {up ? "+" : "−"}
              {Math.abs(trendPct)}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        {isLoading ? <Skeleton className="h-4 w-40" /> : footer}
      </CardFooter>
    </Card>
  );
});
