"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useListState } from "@/hooks/useListState";
import { useDeletePatient, usePatientList } from "@/hooks/usePatients";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { PatientFormSheet } from "./PatientForm";
import { ageBandToQuery, PATIENT_FILTER_KEYS, PatientFilters } from "./PatientFilters";
import { PatientTable } from "./PatientTable";

export function PatientsView() {
  const list = useListState("patients", "createdAt:desc", PATIENT_FILTER_KEYS);
  const query = useMemo(() => {
    const { age, ...rest } = list.filters;
    return { ...rest, ...ageBandToQuery(age), page: list.page, limit: list.limit, sort: list.sort };
  }, [list.filters, list.page, list.limit, list.sort]);
  const { data, isPending: isLoading, isFetching, error, refetch } = usePatientList(query);

  const [editing, setEditing] = useState<Patient | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const deletePatient = useDeletePatient();

  const openEdit = useCallback((patient: Patient) => {
    setEditing(patient);
    setSheetOpen(true);
  }, []);

  return (
    <>
      <PageHeader
        title="Patients"
        description={
          data
            ? `${formatNumber(data.pagination.total)} patient${data.pagination.total === 1 ? "" : "s"}${list.hasFilters ? " match your filters" : " across all doctors"}`
            : "All patients across doctors"
        }
      />

      {error && !data ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <PatientTable
          tableId="patients"
          showDoctor
          data={data?.data}
          pagination={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
          sorting={list.sorting}
          onSortingChange={list.onSortingChange}
          onPageChange={list.onPageChange}
          onPageSizeChange={list.onPageSizeChange}
          onEdit={openEdit}
          onDelete={setDeleting}
          hasFilters={list.hasFilters}
          onClearFilters={list.onClearFilters}
          toolbar={
            <PatientFilters tableId="patients" values={list.filters} onChange={list.onFiltersChange} onClear={list.onClearFilters} />
          }
        />
      )}

      <p className="text-xs text-muted-foreground">New patients are added from a doctor&apos;s page, so every patient has a doctor.</p>

      <PatientFormSheet open={sheetOpen} onOpenChange={setSheetOpen} patient={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "patient"}?`}
        description="This permanently deletes the patient record. This cannot be undone."
        pending={deletePatient.isPending}
        onConfirm={() =>
          deleting &&
          deletePatient.mutate(deleting, {
            onSuccess: () => setDeleting(null),
            onError: (err) => toast.error(errorMessage(err, "Could not delete patient")),
          })
        }
      />
    </>
  );
}
