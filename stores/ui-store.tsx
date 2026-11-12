"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TableId = "doctors" | "patients" | "doctor-patients";

interface UiState {
  /** Preferred rows per page, per table. */
  pageSizes: Partial<Record<TableId, number>>;
  /** Column visibility chosen in the "Columns" menu, per table. */
  hiddenColumns: Partial<Record<TableId, Record<string, boolean>>>;
  commandOpen: boolean;
  setPageSize: (table: TableId, size: number) => void;
  setColumnVisibility: (table: TableId, visibility: Record<string, boolean>) => void;
  setCommandOpen: (open: boolean) => void;
}

/**
 * UI-only preferences (server data lives in TanStack Query, filters live in the URL).
 * Persisted to localStorage; rehydrated after mount to avoid SSR mismatches.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      pageSizes: {},
      hiddenColumns: {},
      commandOpen: false,
      setPageSize: (table, size) => set((s) => ({ pageSizes: { ...s.pageSizes, [table]: size } })),
      setColumnVisibility: (table, visibility) =>
        set((s) => ({ hiddenColumns: { ...s.hiddenColumns, [table]: visibility } })),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
    }),
    {
      name: "doctor-tracker-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pageSizes: s.pageSizes, hiddenColumns: s.hiddenColumns }),
      skipHydration: true,
    },
  ),
);
