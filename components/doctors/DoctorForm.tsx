"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormField } from "@/components/shared/FormField";
import { useCreateDoctor, useDoctorFilterOptions, useUpdateDoctor } from "@/hooks/useDoctors";
import { errorMessage } from "@/lib/api";
import { applyServerErrors } from "@/lib/form-errors";
import type { Doctor } from "@/lib/types";
import { doctorSchema, type DoctorValues } from "@/lib/validators/doctor";

const FIELDS = ["name", "specialization", "hospital", "phone", "email"] as const;
const EMPTY: DoctorValues = { name: "", specialization: "", hospital: "", phone: "", email: "" };

interface DoctorFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when provided, create mode otherwise. */
  doctor?: Doctor | null;
  onCreated?: (doctor: Doctor) => void;
}

/** Create/edit doctor in a side sheet so the list keeps its context. */
export function DoctorFormSheet({ open, onOpenChange, doctor, onCreated }: DoctorFormSheetProps) {
  const isEdit = Boolean(doctor);
  const create = useCreateDoctor();
  const update = useUpdateDoctor(doctor?.id ?? "");
  const { data: options } = useDoctorFilterOptions();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorValues>({ resolver: zodResolver(doctorSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(doctor ? { ...EMPTY, ...pick(doctor) } : EMPTY);
  }, [open, doctor, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (doctor) {
        await update.mutateAsync(values);
      } else {
        const created = await create.mutateAsync(values);
        onCreated?.(created);
      }
      onOpenChange(false);
    } catch (err) {
      if (!applyServerErrors(err, setError, FIELDS)) toast.error(errorMessage(err, "Could not save doctor"));
    }
  });

  return (
    <Sheet open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? "Edit doctor" : "Add doctor"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update this doctor's profile and contact details." : "Register a new doctor. All fields are required."}
          </SheetDescription>
        </SheetHeader>
        <form id="doctor-form" onSubmit={onSubmit} noValidate className="flex-1 space-y-4 overflow-y-auto p-4">
          <FormField id="doctor-name" label="Full name" error={errors.name?.message}>
            {(aria) => <Input {...aria} placeholder="Dr. Sarah Chen" autoComplete="off" {...register("name")} />}
          </FormField>
          <FormField id="doctor-specialization" label="Specialization" error={errors.specialization?.message}>
            {(aria) => <Input {...aria} placeholder="Cardiology" list="specialization-options" {...register("specialization")} />}
          </FormField>
          <FormField id="doctor-hospital" label="Hospital" error={errors.hospital?.message}>
            {(aria) => <Input {...aria} placeholder="St. Mary's Medical Center" list="hospital-options" {...register("hospital")} />}
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="doctor-phone" label="Phone" error={errors.phone?.message}>
              {(aria) => <Input {...aria} type="tel" placeholder="+1 555 201 3344" autoComplete="off" {...register("phone")} />}
            </FormField>
            <FormField id="doctor-email" label="Email" error={errors.email?.message}>
              {(aria) => <Input {...aria} type="email" placeholder="name@hospital.org" autoComplete="off" {...register("email")} />}
            </FormField>
          </div>
          <datalist id="specialization-options">
            {options?.specializations.map((s) => <option key={s} value={s} />)}
          </datalist>
          <datalist id="hospital-options">
            {options?.hospitals.map((h) => <option key={h} value={h} />)}
          </datalist>
        </form>
        <SheetFooter className="flex-row justify-end border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" disabled={pending || (isEdit && !isDirty)}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {isEdit ? "Save changes" : "Add doctor"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function pick(doctor: Doctor): DoctorValues {
  const { name, specialization, hospital, phone, email } = doctor;
  return { name, specialization, hospital, phone, email };
}
