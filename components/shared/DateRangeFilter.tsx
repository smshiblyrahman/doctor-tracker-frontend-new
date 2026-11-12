"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { startOfYear, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate, fromIsoDay, toIsoDay } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  label: string;
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
}

const PRESETS = [
  { label: "Last 7 days", range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 30 days", range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Last 90 days", range: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: "This year", range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

/** Registration-date filter: presets + range calendar, stored as YYYY-MM-DD in the URL. */
export function DateRangeFilter({ label, from, to, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const selected: DateRange | undefined = from || to ? { from: fromIsoDay(from), to: fromIsoDay(to) } : undefined;
  const active = Boolean(from || to);

  const apply = (range: DateRange | undefined) => {
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.to ? toIsoDay(range.to) : range?.from ? toIsoDay(range.from) : undefined,
    });
  };

  const summary = active
    ? `${from ? formatDate(from, "MMM d, yy") : "…"} – ${to ? formatDate(to, "MMM d, yy") : "…"}`
    : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full sm:w-auto">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label={active ? `${label}: ${summary}` : label}
            className={cn("w-full justify-start font-normal sm:w-auto", active ? "border-primary/50 pr-8" : "text-muted-foreground")}
          >
            <CalendarDays aria-hidden />
            {summary}
          </Button>
        </PopoverTrigger>
        {active && (
          <button
            type="button"
            onClick={() => onChange({ from: undefined, to: undefined })}
            className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Clear date filter"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row flex-wrap gap-1 border-b p-2 sm:flex-col sm:border-r sm:border-b-0">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  apply(preset.range());
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : 2}
            selected={selected}
            onSelect={apply}
            defaultMonth={selected?.from ?? subDays(new Date(), 30)}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
