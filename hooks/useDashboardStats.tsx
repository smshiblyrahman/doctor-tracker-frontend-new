"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ApiResponse,
  ConditionCount,
  DashboardSummary,
  Patient,
  PatientsPerDoctor,
  TrendRange,
  Trends,
} from "@/lib/types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  trends: (range: TrendRange) => [...dashboardKeys.all, "trends", range] as const,
  perDoctor: (limit: number) => [...dashboardKeys.all, "per-doctor", limit] as const,
  conditions: (limit: number) => [...dashboardKeys.all, "conditions", limit] as const,
  recent: (limit: number) => [...dashboardKeys.all, "recent", limit] as const,
};

/** Every dashboard query: aggregated server-side, one small payload each. */
function get<T>(path: string, query?: Record<string, string | number>) {
  return ({ signal }: { signal: AbortSignal }) => api<ApiResponse<T>>(path, { query, signal }).then((r) => r.data);
}

export const useDashboardSummary = () =>
  useQuery({ queryKey: dashboardKeys.summary(), queryFn: get<DashboardSummary>("/dashboard/summary") });

export const useTrends = (range: TrendRange) =>
  useQuery({
    queryKey: dashboardKeys.trends(range),
    queryFn: get<Trends>("/dashboard/trends", { range }),
    placeholderData: keepPreviousData,
  });

export const usePatientsPerDoctor = (limit = 10) =>
  useQuery({
    queryKey: dashboardKeys.perDoctor(limit),
    queryFn: get<PatientsPerDoctor>("/dashboard/patients-per-doctor", { limit }),
  });

export const useConditions = (limit = 6) =>
  useQuery({
    queryKey: dashboardKeys.conditions(limit),
    queryFn: get<ConditionCount[]>("/dashboard/conditions", { limit }),
  });

export const useRecentPatients = (limit = 8) =>
  useQuery({
    queryKey: dashboardKeys.recent(limit),
    queryFn: get<Patient[]>("/dashboard/recent-patients", { limit }),
  });
