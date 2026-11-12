"use client";

import { memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value?: string;
  options: FilterOption[];
  onChange: (value: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

/** Single-choice filter with an "All …" option that clears it. */
export const FilterSelect = memo(function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
  className,
  disabled,
}: FilterSelectProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)} disabled={disabled}>
      <SelectTrigger aria-label={label} className={cn("w-full sm:w-44", value && "border-primary/50", className)}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
