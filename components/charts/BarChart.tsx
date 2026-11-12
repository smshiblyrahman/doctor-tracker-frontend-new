"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useConditions, usePatientsPerDoctor } from "@/hooks/useDashboardStats";

const perDoctorConfig = { count: { label: "Patients", color: "var(--chart-1)" } } satisfies ChartConfig;
const conditionsConfig = { count: { label: "Patients", color: "var(--chart-2)" } } satisfies ChartConfig;

const shortName = (name: string) => name.replace(/^Dr\.?\s+/i, "");

/** Top doctors by patient load; bars link to the doctor's page. */
export const PatientsPerDoctorChart = memo(function PatientsPerDoctorChart() {
  const router = useRouter();
  const { data, isPending: isLoading, error, refetch } = usePatientsPerDoctor(8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients per doctor</CardTitle>
        <CardDescription>Top 8 by current patient load</CardDescription>
      </CardHeader>
      <CardContent>
        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !data?.items.length ? (
          <EmptyState title="No patients yet" />
        ) : (
          <ChartContainer config={perDoctorConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={data.items} layout="vertical" margin={{ left: 0, right: 32 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="doctorName"
                type="category"
                tickLine={false}
                axisLine={false}
                width={110}
                tickFormatter={(v: string) => (shortName(v).length > 15 ? `${shortName(v).slice(0, 14)}…` : shortName(v))}
              />
              <XAxis type="number" hide allowDecimals={false} />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideIndicator />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
                className="cursor-pointer"
                onClick={(entry: { payload?: { doctorId?: string } }) => entry.payload?.doctorId && router.push(`/doctors/${entry.payload.doctorId}`)}
              >
                <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
});

/** Most common conditions; the long tail is summarised rather than charted. */
export const ConditionsChart = memo(function ConditionsChart() {
  const { data, isPending: isLoading, error, refetch } = useConditions(8);
  const top = data?.filter((d) => d.condition !== "Other") ?? [];
  const other = data?.find((d) => d.condition === "Other")?.count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top conditions</CardTitle>
        <CardDescription>
          Most frequent diagnoses{other ? ` · ${other} patients across other conditions` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !top.length ? (
          <EmptyState title="No conditions recorded" />
        ) : (
          <ChartContainer config={conditionsConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={top} margin={{ top: 20, left: 16, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="condition"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={8}
                height={48}
                tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
                angle={-25}
                textAnchor="end"
              />
              <YAxis hide allowDecimals={false} />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideIndicator />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
});
