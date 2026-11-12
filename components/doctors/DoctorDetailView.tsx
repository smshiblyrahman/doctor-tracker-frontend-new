"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PatientFormSheet } from "@/components/patients/PatientForm";
import { ageBandToQuery, PATIENT_FILTER_KEYS, PatientFilters } from "@/components/patients/PatientFilters";
import { PatientTable } from "@/components/patients/PatientTable";
import { useDeleteDoctor, useDoctor, useDoctorPatients, useRemovePatientFromDoctor } from "@/hooks/useDoctors";
import { useListState } from "@/hooks/useListState";
import { ApiError, errorMessage } from "@/lib/api";
import { formatDate, formatNumber, initials } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { DoctorFormSheet } from "./DoctorForm";

const DOCTOR_PATIENT_FILTERS = PATIENT_FILTER_KEYS.filter((k) => k !== "doctor");

function InfoRow({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="truncate text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const doctorQuery = useDoctor(id);
  const doctor = doctorQuery.data;

  const list = useListState("doctor-patients", "createdAt:desc", DOCTOR_PATIENT_FILTERS);
  const query = useMemo(() => {
    const { age, ...rest } = list.filters;
    return { ...rest, ...ageBandToQuery(age), page: list.page, limit: list.limit, sort: list.sort };
  }, [list.filters, list.page, list.limit, list.sort]);
  const patients = useDoctorPatients(id, query);

  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [deleteDoctorOpen, setDeleteDoctorOpen] = useState(false);
  const [patientSheet, setPatientSheet] = useState<{ open: boolean; patient: Patient | null }>({ open: false, patient: null });
  const [removing, setRemoving] = useState<Patient | null>(null);

  const deleteDoctor = useDeleteDoctor();
  const removePatient = useRemovePatientFromDoctor(id);

  const openAddPatient = useCallback(() => setPatientSheet({ open: true, patient: null }), []);
  const openEditPatient = useCallback((patient: Patient) => setPatientSheet({ open: true, patient }), []);

  if (doctorQuery.error) {
    const notFound = doctorQuery.error instanceof ApiError && (doctorQuery.error.status === 404 || doctorQuery.error.status === 400);
    return notFound ? (
      <EmptyState
        title="Doctor not found"
        description="This doctor may have been deleted."
        action={
          <Button asChild variant="outline">
            <Link href="/doctors">Back to doctors</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={doctorQuery.error} onRetry={() => doctorQuery.refetch()} />
    );
  }

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/doctors">
            <ArrowLeft aria-hidden /> All doctors
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {doctor ? (
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{initials(doctor.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <Skeleton className="size-16 rounded-full" />
            )}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  {doctor ? (
                    <>
                      <h1 className="truncate text-2xl font-semibold tracking-tight">{doctor.name}</h1>
                      <Badge variant="secondary">{doctor.specialization}</Badge>
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-8 w-56" />
                      <Skeleton className="h-5 w-24" />
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditDoctorOpen(true)} disabled={!doctor}>
                    <Pencil aria-hidden /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteDoctorOpen(true)}
                    disabled={!doctor}
                  >
                    <Trash2 aria-hidden /> Delete
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {doctor ? (
                  <>
                    <InfoRow icon={Mail} label="Email">
                      <a href={`mailto:${doctor.email}`} className="hover:text-primary hover:underline">
                        {doctor.email}
                      </a>
                    </InfoRow>
                    <InfoRow icon={Phone} label="Phone">
                      <a href={`tel:${doctor.phone.replace(/\s/g, "")}`} className="hover:text-primary hover:underline">
                        {doctor.phone}
                      </a>
                    </InfoRow>
                    <InfoRow icon={Building2} label="Hospital">
                      {doctor.hospital}
                    </InfoRow>
                    <InfoRow icon={CalendarDays} label="Registered">
                      {formatDate(doctor.createdAt)}
                    </InfoRow>
                  </>
                ) : (
                  Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10" />)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Patients under care</CardDescription>
            <div className="text-4xl font-semibold tracking-tight tabular-nums">
              {doctor ? (doctor.patientCount === null ? "—" : formatNumber(doctor.patientCount)) : <Skeleton className="h-10 w-16" />}
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={openAddPatient} disabled={!doctor}>
              <UserPlus aria-hidden /> Add patient
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3" aria-labelledby="patients-heading">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" aria-hidden />
          <h2 id="patients-heading" className="text-lg font-semibold">
            Patients
          </h2>
          {patients.data && (
            <Badge variant="outline" className="tabular-nums">
              {formatNumber(patients.data.pagination.total)}
            </Badge>
          )}
        </div>
        {patients.error && !patients.data ? (
          <ErrorState error={patients.error} onRetry={() => patients.refetch()} />
        ) : (
          <PatientTable
            tableId="doctor-patients"
            data={patients.data?.data}
            pagination={patients.data?.pagination}
            isLoading={patients.isPending}
            isFetching={patients.isFetching}
            sorting={list.sorting}
            onSortingChange={list.onSortingChange}
            onPageChange={list.onPageChange}
            onPageSizeChange={list.onPageSizeChange}
            onEdit={openEditPatient}
            onDelete={setRemoving}
            deleteMode="remove"
            hasFilters={list.hasFilters}
            onClearFilters={list.onClearFilters}
            emptyAction={
              <Button size="sm" onClick={openAddPatient}>
                <UserPlus aria-hidden /> Add the first patient
              </Button>
            }
            toolbar={
              <PatientFilters
                tableId="doctor-patients"
                doctorId={id}
                values={list.filters}
                onChange={list.onFiltersChange}
                onClear={list.onClearFilters}
              />
            }
          />
        )}
      </section>

      <DoctorFormSheet open={editDoctorOpen} onOpenChange={setEditDoctorOpen} doctor={doctor} />
      <PatientFormSheet
        open={patientSheet.open}
        onOpenChange={(open) => setPatientSheet((s) => ({ ...s, open }))}
        patient={patientSheet.patient}
        doctor={doctor ? { id: doctor.id, name: doctor.name } : undefined}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "patient"}?`}
        description={`${removing?.name} will be removed from ${doctor?.name}'s patient list and their record deleted.`}
        confirmLabel="Remove"
        pending={removePatient.isPending}
        onConfirm={() =>
          removing &&
          removePatient.mutate(removing, {
            onSuccess: () => setRemoving(null),
            onError: (err) => toast.error(errorMessage(err, "Could not remove patient")),
          })
        }
      />
      <ConfirmDialog
        open={deleteDoctorOpen}
        onOpenChange={setDeleteDoctorOpen}
        title={`Delete ${doctor?.name ?? "doctor"}?`}
        description={
          doctor?.patientCount
            ? `This permanently deletes the doctor and the ${doctor.patientCount} patient${doctor.patientCount === 1 ? "" : "s"} under their care.`
            : "This permanently deletes the doctor."
        }
        pending={deleteDoctor.isPending}
        onConfirm={() =>
          doctor &&
          deleteDoctor.mutate(doctor, {
            onSuccess: () => router.replace("/doctors"),
            onError: (err) => toast.error(errorMessage(err, "Could not delete doctor")),
          })
        }
      />
    </>
  );
}
