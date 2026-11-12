"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import type { Pagination } from "@/lib/types";

export const PAGE_SIZES = [10, 20, 50] as const;

interface DataTablePaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const DataTablePagination = memo(function DataTablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 px-1 sm:flex-row">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{formatNumber(first)}</span>–
        <span className="font-medium text-foreground">{formatNumber(last)}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm text-muted-foreground" id="rows-per-page">
            Rows per page
          </span>
          <Select value={String(limit)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger size="sm" className="w-18" aria-labelledby="rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm font-medium whitespace-nowrap">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="hidden size-8 sm:inline-flex" onClick={() => onPageChange(1)} disabled={!hasPrevPage} aria-label="First page">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => onPageChange(page + 1)} disabled={!hasNextPage} aria-label="Next page">
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon" className="hidden size-8 sm:inline-flex" onClick={() => onPageChange(totalPages)} disabled={!hasNextPage} aria-label="Last page">
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
});
