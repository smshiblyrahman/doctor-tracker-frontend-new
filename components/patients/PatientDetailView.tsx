"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { GenderBadge } from "@/components/shared/GenderBadge";
import { useDeletePatient, usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { ApiError, errorMessage } from "@/lib/api";
import { formatDate, formatRelative, initials } from "@/lib/format";
import { PatientFields, pickPatient } from "./PatientForm";

/** Patient detail + inline edit form (the "edit patient" page from the spec). */
export function PatientDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: patient, error, refetch } = usePatient(id);
  const update = useUpdatePatient(id);
  const remove = useDeletePatient();
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (error) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return notFound ? (
      <EmptyState
        title="Patient not found"
        description="This patient may have been deleted."
        action={
          <Button asChild variant="outline">
            <Link href="/patients">Back to patients</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={() => refetch()} />
    );
  }

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/patients">
            <ArrowLeft aria-hidden /> All patients
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            {patient ? (
              <>
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{initials(patient.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold tracking-tight">{patient.name}</h1>
                  <p className="text-sm text-muted-foreground">{patient.age} years old</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">{patient.condition}</Badge>
                  <GenderBadge gender={patient.gender} />
                </div>
              </>
            ) : (
              <>
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </>
            )}
          </CardContent>
          {patient && (
            <CardFooter className="flex-col items-stretch gap-3 border-t text-sm">
              <Link
                href={`/doctors/${patient.doctor}`}
                className="flex items-center gap-3 rounded-md p-2 -m-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <Stethoscope className="size-4 text-primary" aria-hidden />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-xs text-muted-foreground">Attending doctor</span>
                  <span className="block truncate font-medium">{patient.doctorName}</span>
                </span>
              </Link>
              <dl className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <dt className="text-xs text-muted-foreground">Added</dt>
                  <dd className="font-medium">{formatDate(patient.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Last updated</dt>
                  <dd className="font-medium">{formatRelative(patient.updatedAt)}</dd>
                </div>
              </dl>
            </CardFooter>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient information</CardTitle>
            <CardDescription>Changes are saved to the patient&apos;s record immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            {patient ? (
              <PatientFields
                formId="patient-edit"
                resetKey={patient.id}
                defaultValues={pickPatient(patient)}
                onDirtyChange={setDirty}
                onSubmit={(values) => update.mutateAsync(values)}
              />
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2 border-t">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={!patient}
            >
              <Trash2 aria-hidden /> Delete
            </Button>
            <Button type="submit" form="patient-edit" disabled={!patient || !dirty || update.isPending}>
              {update.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${patient?.name ?? "patient"}?`}
        description="This permanently deletes the patient record. This cannot be undone."
        pending={remove.isPending}
        onConfirm={() =>
          patient &&
          remove.mutate(patient, {
            onSuccess: () => router.replace("/patients"),
            onError: (err) => toast.error(errorMessage(err, "Could not delete patient")),
          })
        }
      />
    </>
  );
}
