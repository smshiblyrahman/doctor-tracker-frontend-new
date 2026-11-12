"use client";

import { memo, useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalize, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

const config = {
  female: { label: "Female", color: "var(--chart-1)" },
  male: { label: "Male", color: "var(--chart-2)" },
  other: { label: "Other", color: "var(--chart-3)" },
} satisfies ChartConfig;

/** Gender split; the legend repeats values as text so colour is never the only cue. */
export const GenderDonut = memo(function GenderDonut({ summary, isLoading }: { summary?: DashboardSummary; isLoading: boolean }) {
  const data = useMemo(() => summary?.genders ?? [], [summary]);
  const total = data.reduce((sum, g) => sum + g.count, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Patient demographics</CardTitle>
        <CardDescription>Gender split · average age {summary ? summary.averagePatientAge : "–"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        {isLoading ? (
          <Skeleton className="size-[200px] rounded-full" />
        ) : (
          <>
            <ChartContainer config={config} className="mx-auto aspect-square h-[200px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="gender" hideLabel />} />
                <Pie data={data} dataKey="count" nameKey="gender" innerRadius={62} outerRadius={90} strokeWidth={4} paddingAngle={2}>
                  {data.map((g) => (
                    <Cell key={g.gender} fill={`var(--color-${g.gender})`} />
                  ))}
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox ? (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                            {formatNumber(total)}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                            patients
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid w-full grid-cols-3 gap-2 text-center text-sm">
              {data.map((g) => (
                <li key={g.gender} className="rounded-md bg-muted/60 px-2 py-1.5">
                  <span className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ background: `var(--color-${g.gender}, var(--chart-${g.gender === "female" ? 1 : g.gender === "male" ? 2 : 3}))` }} aria-hidden />
                    {capitalize(g.gender)}
                  </span>
                  <span className="font-medium tabular-nums">{total ? Math.round((g.count / total) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
});
