"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDeleteDoctor, useDoctorList } from "@/hooks/useDoctors";
import { useListState } from "@/hooks/useListState";
import { errorMessage } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Doctor } from "@/lib/types";
import { toast } from "sonner";
import { DOCTOR_FILTER_KEYS, DoctorFilters } from "./DoctorFilters";
import { DoctorFormSheet } from "./DoctorForm";
import { DoctorTable } from "./DoctorTable";

export function DoctorsView() {
  const router = useRouter();
  const list = useListState("doctors", "createdAt:desc", DOCTOR_FILTER_KEYS);
  const query = useMemo(
    () => ({ ...list.filters, page: list.page, limit: list.limit, sort: list.sort }),
    [list.filters, list.page, list.limit, list.sort],
  );
  const { data, isPending: isLoading, isFetching, error, refetch } = useDoctorList(query);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const deleteDoctor = useDeleteDoctor();

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((doctor: Doctor) => {
    setEditing(doctor);
    setFormOpen(true);
  }, []);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteDoctor.mutate(deleting, {
      onSuccess: () => setDeleting(null),
      onError: (err) => toast.error(errorMessage(err, "Could not delete doctor")),
    });
  };

  return (
    <>
      <PageHeader
        title="Doctors"
        description={
          data ? `${formatNumber(data.pagination.total)} doctor${data.pagination.total === 1 ? "" : "s"}${list.hasFilters ? " match your filters" : " registered"}` : "Manage doctors and their patients"
        }
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden /> Add doctor
          </Button>
        }
      />

      {error && !data ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DoctorTable
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
          toolbar={<DoctorFilters values={list.filters} onChange={list.onFiltersChange} onClear={list.onClearFilters} />}
        />
      )}

      <DoctorFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editing}
        onCreated={(doctor) => router.push(`/doctors/${doctor.id}`)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "doctor"}?`}
        description={
          <p>
            This permanently deletes the doctor
            {deleting?.patientCount ? (
              <>
                {" "}
                and <strong className="text-foreground">{deleting.patientCount} patient{deleting.patientCount === 1 ? "" : "s"}</strong> under
                their care
              </>
            ) : null}
            . This cannot be undone.
          </p>
        }
        pending={deleteDoctor.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
