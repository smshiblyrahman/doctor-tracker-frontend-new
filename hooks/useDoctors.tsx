"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ApiList, ApiResponse, Doctor, DoctorFilterOptions, Patient, QueryParams } from "@/lib/types";
import type { DoctorValues } from "@/lib/validators/doctor";
import type { PatientValues } from "@/lib/validators/patient";
import { dashboardKeys } from "./useDashboardStats";
import { patientKeys } from "./usePatients";

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (params: QueryParams) => [...doctorKeys.lists(), params] as const,
  detail: (id: string) => [...doctorKeys.all, "detail", id] as const,
  filters: () => [...doctorKeys.all, "filters"] as const,
  patients: (id: string, params: QueryParams) => [...doctorKeys.all, "patients", id, params] as const,
};

export function useDoctorList(params: QueryParams) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: ({ signal }) => api<ApiList<Doctor>>("/doctors", { query: params, signal }),
    // Keep showing the current page while the next one loads: no table flicker.
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: ({ signal }) => api<ApiResponse<Doctor>>(`/doctors/${id}`, { signal }).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useDoctorFilterOptions() {
  return useQuery({
    queryKey: doctorKeys.filters(),
    queryFn: ({ signal }) =>
      api<ApiResponse<DoctorFilterOptions>>("/doctors/filters", { signal }).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorPatients(doctorId: string, params: QueryParams) {
  return useQuery({
    queryKey: doctorKeys.patients(doctorId, params),
    queryFn: ({ signal }) => api<ApiList<Patient>>(`/doctors/${doctorId}/patients`, { query: params, signal }),
    placeholderData: keepPreviousData,
  });
}

/**
 * Refreshes everything derived from doctor or patient data. `deletedId` skips the
 * deleted entity's own queries: refetching them would 404 while the page that
 * shows them is still mounted (they are garbage-collected after navigation).
 */
export function useInvalidateClinicData() {
  const queryClient = useQueryClient();
  return (deletedId?: string) =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const [root] = query.queryKey;
        const affected = root === doctorKeys.all[0] || root === patientKeys.all[0] || root === dashboardKeys.all[0];
        return affected && !(deletedId && query.queryKey.includes(deletedId));
      },
    });
}

export function useCreateDoctor() {
  const invalidate = useInvalidateClinicData();
  return useMutation({
    mutationFn: (values: DoctorValues) =>
      api<ApiResponse<Doctor>>("/doctors", { method: "POST", body: values }).then((r) => r.data),
    onSuccess: (doctor) => {
      toast.success(`${doctor.name} added`);
      return invalidate();
    },
  });
}

export function useUpdateDoctor(id: string) {
  const invalidate = useInvalidateClinicData();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<DoctorValues>) =>
      api<ApiResponse<Doctor>>(`/doctors/${id}`, { method: "PATCH", body: values }).then((r) => r.data),
    onSuccess: (doctor) => {
      queryClient.setQueryData(doctorKeys.detail(id), doctor);
      toast.success("Doctor updated");
      return invalidate();
    },
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateClinicData();
  return useMutation({
    mutationFn: (doctor: Pick<Doctor, "id" | "name">) =>
      api<ApiResponse<{ id: string; deletedPatients: number }>>(`/doctors/${doctor.id}`, { method: "DELETE" }).then(
        (r) => ({ ...r.data, name: doctor.name }),
      ),
    onSuccess: (result) => {
      toast.success(
        `${result.name} deleted` +
          (result.deletedPatients ? ` with ${result.deletedPatients} patient${result.deletedPatients === 1 ? "" : "s"}` : ""),
      );
      return invalidate(result.id);
    },
  });
}

export function useAddPatientToDoctor(doctorId: string) {
  const invalidate = useInvalidateClinicData();
  return useMutation({
    mutationFn: (values: PatientValues) =>
      api<ApiResponse<Patient>>(`/doctors/${doctorId}/patients`, { method: "POST", body: values }).then((r) => r.data),
    onSuccess: (patient) => {
      toast.success(`${patient.name} added to ${patient.doctorName}'s patients`);
      return invalidate();
    },
  });
}

export function useRemovePatientFromDoctor(doctorId: string) {
  const invalidate = useInvalidateClinicData();
  return useMutation({
    mutationFn: (patient: Pick<Patient, "id" | "name">) =>
      api(`/doctors/${doctorId}/patients/${patient.id}`, { method: "DELETE" }).then(() => patient),
    onSuccess: (patient) => {
      toast.success(`${patient.name} removed`);
      return invalidate(patient.id);
    },
  });
}
