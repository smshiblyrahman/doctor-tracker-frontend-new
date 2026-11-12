"use client";

import { memo, useMemo } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { SearchInput } from "@/components/shared/SearchInput";
import { useDoctorFilterOptions } from "@/hooks/useDoctors";
import { DOCTOR_TOGGLEABLE_COLUMNS } from "./DoctorTable";

export const DOCTOR_FILTER_KEYS = ["search", "specialization", "hospital", "from", "to"] as const;

interface DoctorFiltersProps {
  values: Record<string, string | undefined>;
  onChange: (updates: Record<string, string | undefined>) => void;
  onClear: () => void;
}

export const DoctorFilters = memo(function DoctorFilters({ values, onChange, onClear }: DoctorFiltersProps) {
  const { data: options, isPending: isLoading } = useDoctorFilterOptions();
  const specializations = useMemo(() => (options?.specializations ?? []).map((v) => ({ value: v, label: v })), [options]);
  const hospitals = useMemo(() => (options?.hospitals ?? []).map((v) => ({ value: v, label: v })), [options]);
  const active = DOCTOR_FILTER_KEYS.some((k) => values[k]);

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchInput
        label="Search doctors"
        placeholder="Search name, specialty, hospital, email…"
        value={values.search ?? ""}
        onChange={(search) => onChange({ search })}
        className="w-full lg:w-80"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <FilterSelect
          label="Filter by specialization"
          allLabel="All specializations"
          value={values.specialization}
          options={specializations}
          onChange={(specialization) => onChange({ specialization })}
          disabled={isLoading}
        />
        <FilterSelect
          label="Filter by hospital"
          allLabel="All hospitals"
          value={values.hospital}
          options={hospitals}
          onChange={(hospital) => onChange({ hospital })}
          disabled={isLoading}
        />
        <div className="col-span-2 sm:col-span-1">
          <DateRangeFilter label="Registered" from={values.from} to={values.to} onChange={onChange} />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        {active && (
          <Button variant="ghost" onClick={onClear}>
            <FilterX aria-hidden /> Clear
          </Button>
        )}
        <DataTableViewOptions tableId="doctors" columns={DOCTOR_TOGGLEABLE_COLUMNS} />
      </div>
    </div>
  );
});
