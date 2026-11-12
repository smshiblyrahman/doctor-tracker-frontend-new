"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Command } from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import type { ApiList, Doctor, Patient } from "@/lib/types";
import { useUiStore } from "@/stores/ui-store";
import { NAV_ITEMS } from "./nav";

/** Header button that opens the palette; shows the shortcut on desktop. */
export function CommandMenuTrigger() {
  const setOpen = useUiStore((s) => s.setCommandOpen);
  return (
    <Button
      variant="outline"
      onClick={() => setOpen(true)}
      className="h-9 w-9 justify-start px-0 text-muted-foreground sm:w-56 sm:px-3 lg:w-64"
      aria-label="Search doctors and patients"
    >
      <Search className="mx-auto sm:mx-0" aria-hidden />
      <span className="hidden flex-1 text-left font-normal sm:inline">Search…</span>
      <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
        Ctrl K
      </kbd>
    </Button>
  );
}

/** Global ⌘K / Ctrl+K palette: jump to a page or search doctors and patients by name. */
export function CommandMenu() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const [search, setSearch] = useState("");
  const term = useDebounce(search.trim(), 250);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const results = useQuery({
    queryKey: ["command-search", term],
    queryFn: async ({ signal }) => {
      const [doctors, patients] = await Promise.all([
        api<ApiList<Doctor>>("/doctors", { query: { search: term, limit: 5 }, signal }),
        api<ApiList<Patient>>("/patients", { query: { search: term, limit: 5 }, signal }),
      ]);
      return { doctors: doctors.data, patients: patients.data };
    },
    enabled: open && term.length > 0,
    staleTime: 30_000,
  });

  const go = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  const hasResults = Boolean(results.data?.doctors.length || results.data?.patients.length);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search doctors and patients">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search doctors, patients…" value={search} onValueChange={setSearch} />
        <CommandList>
          {term && results.isFetching && !results.data && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Searching…
            </div>
          )}
          {term && results.data && !hasResults && <CommandEmpty>No doctors or patients match “{term}”.</CommandEmpty>}
          {!term && (
            <CommandGroup heading="Go to">
              {NAV_ITEMS.map((item) => (
                <CommandItem key={item.href} value={item.href} onSelect={() => go(item.href)}>
                  <item.icon aria-hidden />
                  {item.title}
                  <span className="ml-auto text-xs text-muted-foreground">{item.description}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!!results.data?.doctors.length && term && (
            <CommandGroup heading="Doctors">
              {results.data.doctors.map((d) => (
                <CommandItem key={d.id} value={`doctor-${d.id}`} onSelect={() => go(`/doctors/${d.id}`)}>
                  <Stethoscope aria-hidden />
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{d.specialization}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!!results.data?.doctors.length && !!results.data?.patients.length && term && <CommandSeparator />}
          {!!results.data?.patients.length && term && (
            <CommandGroup heading="Patients">
              {results.data.patients.map((p) => (
                <CommandItem key={p.id} value={`patient-${p.id}`} onSelect={() => go(`/patients/${p.id}`)}>
                  <UserRound aria-hidden />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{p.condition}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
