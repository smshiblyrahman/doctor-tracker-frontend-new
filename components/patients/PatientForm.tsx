"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormField } from "@/components/shared/FormField";
import { useAddPatientToDoctor } from "@/hooks/useDoctors";
import { usePatientFilterOptions, useUpdatePatient } from "@/hooks/usePatients";
import { errorMessage } from "@/lib/api";
import { capitalize } from "@/lib/format";
import { applyServerErrors } from "@/lib/form-errors";
import type { Patient } from "@/lib/types";
import { GENDERS, patientSchema, type PatientValues } from "@/lib/validators/patient";

const FIELDS = ["name", "age", "gender", "condition", "phone"] as const;

interface PatientFieldsProps {
  formId: string;
  defaultValues?: Partial<PatientValues>;
  onSubmit: (values: PatientValues) => Promise<unknown>;
  onDirtyChange?: (dirty: boolean) => void;
  resetKey?: unknown;
}

/** The patient form body, shared by the add/edit sheet and the patient detail page. */
export function PatientFields({ formId, defaultValues, onSubmit, onDirtyChange, resetKey }: PatientFieldsProps) {
  const { data: options } = usePatientFilterOptions();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: "", condition: "", phone: "", ...defaultValues },
  });

  useEffect(() => {
    reset({ name: "", condition: "", phone: "", ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, reset]);

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(values);
    } catch (err) {
      if (!applyServerErrors(err, setError, FIELDS)) toast.error(errorMessage(err, "Could not save patient"));
    }
  });

  return (
    <form id={formId} onSubmit={submit} noValidate className="space-y-4">
      <FormField id={`${formId}-name`} label="Full name" error={errors.name?.message}>
        {(aria) => <Input {...aria} placeholder="James Walker" autoComplete="off" {...register("name")} />}
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id={`${formId}-age`} label="Age" error={errors.age?.message}>
          {(aria) => <Input {...aria} type="number" inputMode="numeric" min={0} max={130} {...register("age", { valueAsNumber: true })} />}
        </FormField>
        <FormField id={`${formId}-gender`} label="Gender" error={errors.gender?.message}>
          {(aria) => (
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger {...aria} className="w-full" onBlur={field.onBlur}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {capitalize(g)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
      </div>
      <FormField id={`${formId}-condition`} label="Condition" error={errors.condition?.message} hint="Primary diagnosis or reason for care">
        {(aria) => <Input {...aria} placeholder="Hypertension" list={`${formId}-conditions`} {...register("condition")} />}
      </FormField>
      <FormField id={`${formId}-phone`} label="Phone" error={errors.phone?.message}>
        {(aria) => <Input {...aria} type="tel" placeholder="+1 555 404 1212" autoComplete="off" {...register("phone")} />}
      </FormField>
      <datalist id={`${formId}-conditions`}>
        {options?.conditions.map((c) => <option key={c} value={c} />)}
      </datalist>
    </form>
  );
}

interface PatientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit an existing patient… */
  patient?: Patient | null;
  /** …or add a new one under this doctor. */
  doctor?: { id: string; name: string };
}

export function PatientFormSheet({ open, onOpenChange, patient, doctor }: PatientFormSheetProps) {
  const update = useUpdatePatient(patient?.id ?? "");
  const add = useAddPatientToDoctor(doctor?.id ?? "");
  const pending = update.isPending || add.isPending;
  const isEdit = Boolean(patient);

  const onSubmit = async (values: PatientValues) => {
    if (patient) await update.mutateAsync(values);
    else await add.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? "Edit patient" : "Add patient"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Under the care of ${patient?.doctorName}.`
              : `The patient will be added to ${doctor?.name ?? "this doctor"}'s list.`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {open && (
            <PatientFields
              formId="patient-form"
              resetKey={patient?.id ?? "new"}
              defaultValues={patient ? pickPatient(patient) : undefined}
              onSubmit={onSubmit}
            />
          )}
        </div>
        <SheetFooter className="flex-row justify-end border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {isEdit ? "Save changes" : "Add patient"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function pickPatient(p: Patient): PatientValues {
  return { name: p.name, age: p.age, gender: p.gender, condition: p.condition, phone: p.phone };
}
