"use client";

import { useCallback, useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";
import { sortingFromParam, sortingToParam } from "@/components/data-table/DataTable";
import { useUiStore, type TableId } from "@/stores/ui-store";
import { intParam, useQueryParams } from "./useQueryParams";

/**
 * URL-backed list state shared by every table page: page, page size, sorting and
 * filters. Handlers are stable so memoized tables and filter bars do not re-render
 * on unrelated state changes.
 */
export function useListState(tableId: TableId, defaultSort: string, filterKeys: readonly string[]) {
  const { params, setParams, clearParams } = useQueryParams();
  const preferredSize = useUiStore((s) => s.pageSizes[tableId]) ?? 10;
  const setPageSize = useUiStore((s) => s.setPageSize);

  const page = intParam(params.page, 1);
  const limit = intParam(params.limit, preferredSize);
  const sort = params.sort ?? defaultSort;
  const sorting = useMemo(() => sortingFromParam(sort, defaultSort), [sort, defaultSort]);

  const filters = useMemo(
    () => Object.fromEntries(filterKeys.map((k) => [k, params[k] || undefined])) as Record<string, string | undefined>,
    [params, filterKeys],
  );
  const hasFilters = filterKeys.some((k) => params[k]);

  const onPageChange = useCallback((p: number) => setParams({ page: p > 1 ? p : undefined }), [setParams]);
  const onPageSizeChange = useCallback(
    (size: number) => {
      setPageSize(tableId, size);
      setParams({ limit: size });
    },
    [setParams, setPageSize, tableId],
  );
  const onSortingChange = useCallback(
    (next: SortingState) => {
      const value = sortingToParam(next);
      setParams({ sort: value === defaultSort ? undefined : value });
    },
    [setParams, defaultSort],
  );
  const onFiltersChange = useCallback((updates: Record<string, string | undefined>) => setParams(updates), [setParams]);
  const onClearFilters = useCallback(() => clearParams([...filterKeys]), [clearParams, filterKeys]);

  return {
    page,
    limit,
    sort,
    sorting,
    filters,
    hasFilters,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
    onFiltersChange,
    onClearFilters,
  };
}
