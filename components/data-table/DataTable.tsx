"use client";

import { useMemo, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Pagination } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUiStore, type TableId } from "@/stores/ui-store";
import { DataTablePagination } from "./DataTablePagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Classes for both header and cells (e.g. responsive hiding). */
    className?: string;
    /** Label used in the column visibility menu. */
    label?: string;
  }
}

const EMPTY_VISIBILITY: VisibilityState = {};

export interface DataTableProps<TData> {
  tableId: TableId;
  // Mixed value types per column: TanStack documents `any` here; `unknown` breaks assignability.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[] | undefined;
  isLoading: boolean;
  /** True while a new page/filter result is loading behind the current one. */
  isFetching?: boolean;
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  emptyState: ReactNode;
  getRowId: (row: TData) => string;
  toolbar?: ReactNode;
  caption: string;
}

/**
 * Server-driven table: pagination and sorting are delegated to the API
 * (`manualPagination` / `manualSorting`), so only one page is ever in memory.
 * Column visibility is a persisted UI preference.
 */
export function DataTable<TData>({
  tableId,
  columns,
  data,
  isLoading,
  isFetching,
  pagination,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  emptyState,
  getRowId,
  toolbar,
  caption,
}: DataTableProps<TData>) {
  const columnVisibility = useUiStore((s) => s.hiddenColumns[tableId]) ?? EMPTY_VISIBILITY;
  const setColumnVisibility = useUiStore((s) => s.setColumnVisibility);
  const rows = useMemo(() => data ?? [], [data]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    pageCount: pagination?.totalPages ?? -1,
    state: { sorting, columnVisibility },
    onSortingChange: (updater) => onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility(tableId, typeof updater === "function" ? updater(columnVisibility) : updater),
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const skeletonRows = pagination?.limit ?? 10;

  return (
    <div className="space-y-3">
      {toolbar}
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card transition-opacity",
          isFetching && !isLoading && "opacity-70",
        )}
        aria-busy={isLoading || isFetching}
      >
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className={cn("h-10", header.column.columnDef.meta?.className)}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(skeletonRows, 10) }, (_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} className={column.columnDef.meta?.className}>
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("py-2.5", cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns.length}>{emptyState}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.total > 0 && (
        <DataTablePagination pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      )}
    </div>
  );
}

/** "name:asc" ↔ [{ id: "name", desc: false }] */
export function sortingFromParam(value: string | undefined, fallback: string): SortingState {
  const [id, dir] = (value ?? fallback).split(":");
  return [{ id, desc: dir !== "asc" }];
}

export function sortingToParam(sorting: SortingState): string | undefined {
  const first = sorting[0];
  return first ? `${first.id}:${first.desc ? "desc" : "asc"}` : undefined;
}
