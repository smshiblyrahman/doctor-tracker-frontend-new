"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ApiList, ApiResponse, Patient, PatientFilterOptions, QueryParams } from "@/lib/types";
import type { PatientValues } from "@/lib/validators/patient";
import { dashboardKeys } from "./useDashboardStats";

export const patientKeys = {
  all: ["patients"] as const,
  list: (params: QueryParams) => [...patientKeys.all, "list", params] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
  filters: (doctor?: string) => [...patientKeys.all, "filters", doctor ?? "all"] as const,
};

export function usePatientList(params: QueryParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: ({ signal }) => api<ApiList<Patient>>("/patients", { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: ({ signal }) => api<ApiResponse<Patient>>(`/patients/${id}`, { signal }).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function usePatientFilterOptions(doctor?: string) {
  return useQuery({
    queryKey: patientKeys.filters(doctor),
    queryFn: ({ signal }) =>
      api<ApiResponse<PatientFilterOptions>>("/patients/filters", { query: { doctor }, signal }).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

/** Same predicate as doctors: patients, doctors (lists/counts) and dashboard, minus a deleted id. */
function useInvalidatePatients() {
  const queryClient = useQueryClient();
  return (deletedId?: string) =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const [root] = query.queryKey;
        const affected = root === patientKeys.all[0] || root === "doctors" || root === dashboardKeys.all[0];
        return affected && !(deletedId && query.queryKey.includes(deletedId));
      },
    });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: (values: Partial<PatientValues>) =>
      api<ApiResponse<Patient>>(`/patients/${id}`, { method: "PATCH", body: values }).then((r) => r.data),
    onSuccess: (patient) => {
      queryClient.setQueryData(patientKeys.detail(id), patient);
      toast.success(`${patient.name} updated`);
      return invalidate();
    },
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatients();
  return useMutation({
    mutationFn: (patient: Pick<Patient, "id" | "name">) =>
      api(`/patients/${patient.id}`, { method: "DELETE" }).then(() => patient),
    onSuccess: (patient) => {
      toast.success(`${patient.name} deleted`);
      return invalidate(patient.id);
    },
  });
}
