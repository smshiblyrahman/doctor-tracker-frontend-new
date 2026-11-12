"use client";

import { Activity, Stethoscope, UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useDashboardSummary } from "@/hooks/useDashboardStats";
import { useSession } from "@/lib/auth";
import { formatNumber } from "@/lib/format";
import { ConditionsChart, PatientsPerDoctorChart } from "./BarChart";
import { GenderDonut } from "./DonutChart";
import { RegistrationsChart } from "./LineChart";
import { RecentPatients } from "./RecentPatients";
import { StatCard } from "./StatCard";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** Each widget owns its query, so they load (and fail) independently. */
export function DashboardView() {
  const { data: user } = useSession();
  const { data: summary, isPending: isLoading, error, refetch } = useDashboardSummary();

  return (
    <>
      <PageHeader
        title={user ? `${greeting()}, ${user.name.split(" ")[0]}` : "Dashboard"}
        description="Here is what is happening across your clinics."
      />

      {error && !summary ? (
        <ErrorState error={error} onRetry={() => refetch()} title="Could not load key metrics" />
      ) : (
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 @container sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total doctors"
            icon={Stethoscope}
            isLoading={isLoading}
            value={summary && formatNumber(summary.totalDoctors)}
            trendPct={summary?.doctorGrowthPct}
            footer={summary && `${summary.newDoctorsThisMonth} joined this month`}
          />
          <StatCard
            label="Total patients"
            icon={Users}
            isLoading={isLoading}
            value={summary && formatNumber(summary.totalPatients)}
            trendPct={summary?.patientGrowthPct}
            footer={summary && `${formatNumber(summary.newPatientsThisMonth)} added this month`}
          />
          <StatCard
            label="Avg. patients per doctor"
            icon={Activity}
            isLoading={isLoading}
            value={summary && String(summary.avgPatientsPerDoctor)}
            footer="Across all registered doctors"
          />
          <StatCard
            label="New patients this month"
            icon={UserPlus}
            isLoading={isLoading}
            value={summary && formatNumber(summary.newPatientsThisMonth)}
            trendPct={summary?.patientGrowthPct}
            footer="Compared with last month"
          />
        </section>
      )}

      <RegistrationsChart />

      <div className="grid gap-4 lg:grid-cols-2">
        <PatientsPerDoctorChart />
        <ConditionsChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentPatients />
        </div>
        <GenderDonut summary={summary} isLoading={isLoading} />
      </div>
    </>
  );
}
