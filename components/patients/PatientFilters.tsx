"use client";

import { memo, useMemo } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { SearchInput } from "@/components/shared/SearchInput";
import { usePatientFilterOptions } from "@/hooks/usePatients";
import type { TableId } from "@/stores/ui-store";
import { DoctorCombobox } from "./DoctorCombobox";
import { PATIENT_TOGGLEABLE_COLUMNS } from "./PatientTable";

export const AGE_BANDS = [
  { value: "0-17", label: "Children (0–17)" },
  { value: "18-39", label: "18–39" },
  { value: "40-64", label: "40–64" },
  { value: "65-130", label: "65+" },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export const PATIENT_FILTER_KEYS = ["search", "condition", "gender", "age", "doctor", "from", "to"] as const;

/** URL `age=40-64` → API `minAge`/`maxAge`. */
export function ageBandToQuery(band?: string) {
  const [min, max] = band?.split("-").map(Number) ?? [];
  return Number.isFinite(min) ? { minAge: min, maxAge: max } : {};
}

interface PatientFiltersProps {
  tableId: TableId;
  values: Record<string, string | undefined>;
  onChange: (updates: Record<string, string | undefined>) => void;
  onClear: () => void;
  /** Scope condition options to one doctor; hides the doctor filter. */
  doctorId?: string;
}

export const PatientFilters = memo(function PatientFilters({ tableId, values, onChange, onClear, doctorId }: PatientFiltersProps) {
  const { data: options, isPending: isLoading } = usePatientFilterOptions(doctorId);
  const conditions = useMemo(() => (options?.conditions ?? []).map((c) => ({ value: c, label: c })), [options]);
  const active = PATIENT_FILTER_KEYS.some((k) => values[k]);
  const columns = doctorId ? PATIENT_TOGGLEABLE_COLUMNS.filter((c) => c.id !== "doctorName") : PATIENT_TOGGLEABLE_COLUMNS;

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchInput
        label="Search patients"
        placeholder="Search name, condition, phone…"
        value={values.search ?? ""}
        onChange={(search) => onChange({ search })}
        className="w-full lg:w-72"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <FilterSelect
          label="Filter by condition"
          allLabel="All conditions"
          value={values.condition}
          options={conditions}
          onChange={(condition) => onChange({ condition })}
          disabled={isLoading}
        />
        <FilterSelect
          label="Filter by gender"
          allLabel="All genders"
          value={values.gender}
          options={GENDER_OPTIONS}
          onChange={(gender) => onChange({ gender })}
          className="sm:w-36"
        />
        <FilterSelect
          label="Filter by age group"
          allLabel="All ages"
          value={values.age}
          options={AGE_BANDS}
          onChange={(age) => onChange({ age })}
          className="sm:w-40"
        />
        {!doctorId && <DoctorCombobox value={values.doctor} onChange={(doctor) => onChange({ doctor })} />}
        <div className="col-span-2 sm:col-span-1">
          <DateRangeFilter label="Added" from={values.from} to={values.to} onChange={onChange} />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        {active && (
          <Button variant="ghost" onClick={onClear}>
            <FilterX aria-hidden /> Clear
          </Button>
        )}
        <DataTableViewOptions tableId={tableId} columns={columns} />
      </div>
    </div>
  );
});
