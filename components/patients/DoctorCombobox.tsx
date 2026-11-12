"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDoctor, useDoctorList } from "@/hooks/useDoctors";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface DoctorComboboxProps {
  value?: string;
  onChange: (doctorId: string | undefined) => void;
}

/** Server-searched doctor picker: works for any number of doctors (never loads them all). */
export function DoctorCombobox({ value, onChange }: DoctorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const term = useDebounce(search.trim(), 250);
  const { data, isFetching } = useDoctorList({ search: term || undefined, limit: 8, sort: "name:asc" });
  const selected = useDoctor(value ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full sm:w-52">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Filter by doctor"
            className={cn("w-full justify-between font-normal", value ? "border-primary/50 pr-8" : "text-muted-foreground")}
          >
            <span className="truncate">{value ? (selected.data?.name ?? "Loading…") : "All doctors"}</span>
            {!value && <ChevronsUpDown className="opacity-50" aria-hidden />}
          </Button>
        </PopoverTrigger>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Clear doctor filter"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search doctors…" value={search} onValueChange={setSearch} />
          <CommandList>
            {!isFetching && <CommandEmpty>No doctors found.</CommandEmpty>}
            <CommandGroup>
              {data?.data.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={doctor.id}
                  onSelect={() => {
                    onChange(doctor.id === value ? undefined : doctor.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn(doctor.id === value ? "opacity-100" : "opacity-0")} aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate">{doctor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
