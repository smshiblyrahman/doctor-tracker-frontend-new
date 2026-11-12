"use client";

import { memo, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTrends } from "@/hooks/useDashboardStats";
import { formatDate, formatNumber } from "@/lib/format";
import type { TrendRange } from "@/lib/types";

const config = {
  patients: { label: "Patients", color: "var(--chart-1)" },
  doctors: { label: "Doctors", color: "var(--chart-2)" },
} satisfies ChartConfig;

const RANGES: Array<{ value: TrendRange; label: string }> = [
  { value: "12m", label: "12 months" },
  { value: "90d", label: "90 days" },
  { value: "30d", label: "30 days" },
  { value: "7d", label: "7 days" },
];

/** Registrations over time (dashboard-01's interactive area chart, fed by /dashboard/trends). */
export const RegistrationsChart = memo(function RegistrationsChart() {
  const [range, setRange] = useState<TrendRange>("12m");
  const { data, isPending: isLoading, error, refetch } = useTrends(range);
  const monthly = data?.unit === "month";

  const totals = useMemo(
    () => ({
      patients: data?.series.reduce((sum, p) => sum + p.patients, 0) ?? 0,
      doctors: data?.series.reduce((sum, p) => sum + p.doctors, 0) ?? 0,
    }),
    [data],
  );
  const tick = (value: string) => formatDate(monthly ? `${value}-01` : value, monthly ? "MMM" : "MMM d");
  const label = (value: string) => formatDate(monthly ? `${value}-01` : value, monthly ? "MMMM yyyy" : "EEE, MMM d");

  return (
    <Card className="@container/chart">
      <CardHeader>
        <CardTitle>Registrations</CardTitle>
        <CardDescription>
          {data ? (
            <>
              <span className="font-medium text-foreground">{formatNumber(totals.patients)}</span> patients and{" "}
              <span className="font-medium text-foreground">{formatNumber(totals.doctors)}</span> doctors added in the last{" "}
              {RANGES.find((r) => r.value === range)?.label}
            </>
          ) : (
            "New patients and doctors over time"
          )}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as TrendRange)}
            variant="outline"
            className="hidden @[620px]/chart:flex"
            aria-label="Time range"
          >
            {RANGES.map((r) => (
              <ToggleGroupItem key={r.value} value={r.value} className="px-3">
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={(v) => setRange(v as TrendRange)}>
            <SelectTrigger size="sm" className="w-32 @[620px]/chart:hidden" aria-label="Time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
            <AreaChart data={data?.series} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                {(["patients", "doctors"] as const).map((key) => (
                  <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={tick} />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => label(String(v))} />} />
              <Area dataKey="doctors" type="monotone" fill="url(#fill-doctors)" stroke="var(--color-doctors)" strokeWidth={2} />
              <Area dataKey="patients" type="monotone" fill="url(#fill-patients)" stroke="var(--color-patients)" strokeWidth={2} />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
});
