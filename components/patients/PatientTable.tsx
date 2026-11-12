"use client";

import { memo, useMemo, type ReactNode } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2, UserMinus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { GenderBadge } from "@/components/shared/GenderBadge";
import { formatDate } from "@/lib/format";
import type { Pagination, Patient } from "@/lib/types";
import type { TableId } from "@/stores/ui-store";

interface PatientTableProps {
  tableId: TableId;
  data: Patient[] | undefined;
  pagination?: Pagination;
  isLoading: boolean;
  isFetching: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  /** Patients page shows the doctor column; a doctor's own page does not. */
  showDoctor?: boolean;
  /** "remove" = remove from this doctor's list, "delete" = delete the record. */
  deleteMode?: "delete" | "remove";
  hasFilters: boolean;
  onClearFilters: () => void;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
}

export const PATIENT_TOGGLEABLE_COLUMNS = [
  { id: "gender", label: "Gender" },
  { id: "doctorName", label: "Doctor" },
  { id: "phone", label: "Phone" },
  { id: "createdAt", label: "Added" },
];

const RowActions = memo(function RowActions({
  patient,
  onEdit,
  onDelete,
  deleteMode,
}: {
  patient: Patient;
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
  deleteMode: "delete" | "remove";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${patient.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/patients/${patient.id}`}>
            <Eye aria-hidden /> View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(patient)}>
          <Pencil aria-hidden /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(patient)}>
          {deleteMode === "remove" ? <UserMinus aria-hidden /> : <Trash2 aria-hidden />}
          {deleteMode === "remove" ? "Remove from list" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function PatientTable({
  onEdit,
  onDelete,
  showDoctor = false,
  deleteMode = "delete",
  hasFilters,
  onClearFilters,
  emptyAction,
  ...props
}: PatientTableProps) {
  const columns = useMemo<ColumnDef<Patient>[]>(() => {
    const cols: ColumnDef<Patient>[] = [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
        cell: ({ row }) => (
          <Link
            href={`/patients/${row.original.id}`}
            className="block min-w-0 rounded-md font-medium hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="block truncate">{row.original.name}</span>
            <span className="block text-xs font-normal text-muted-foreground sm:hidden">
              {row.original.age} yrs · {row.original.condition}
            </span>
          </Link>
        ),
      },
      {
        id: "age",
        accessorKey: "age",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
        meta: { className: "hidden sm:table-cell w-20" },
        cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
      },
      {
        id: "gender",
        accessorKey: "gender",
        enableSorting: false,
        header: "Gender",
        meta: { className: "hidden lg:table-cell", label: "Gender" },
        cell: ({ row }) => <GenderBadge gender={row.original.gender} />,
      },
      {
        id: "condition",
        accessorKey: "condition",
        enableSorting: false,
        header: "Condition",
        meta: { className: "hidden sm:table-cell" },
        cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
      },
    ];
    if (showDoctor) {
      cols.push({
        id: "doctorName",
        accessorKey: "doctorName",
        enableSorting: false,
        header: "Doctor",
        meta: { className: "hidden md:table-cell", label: "Doctor" },
        cell: ({ row }) => (
          <Link href={`/doctors/${row.original.doctor}`} className="truncate text-muted-foreground hover:text-primary hover:underline">
            {row.original.doctorName}
          </Link>
        ),
      });
    }
    cols.push(
      {
        id: "phone",
        accessorKey: "phone",
        enableSorting: false,
        header: "Phone",
        meta: { className: "hidden xl:table-cell whitespace-nowrap", label: "Phone" },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
        meta: { className: "hidden md:table-cell whitespace-nowrap", label: "Added" },
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => <RowActions patient={row.original} onEdit={onEdit} onDelete={onDelete} deleteMode={deleteMode} />,
      },
    );
    return cols;
  }, [onEdit, onDelete, showDoctor, deleteMode]);

  return (
    <DataTable
      caption="Patients"
      columns={columns}
      getRowId={(p) => p.id}
      emptyState={
        hasFilters ? (
          <EmptyState
            title="No patients match your filters"
            description="Try a different search term or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState icon={Users} title="No patients yet" description="Patients you add will appear here." action={emptyAction} />
        )
      }
      {...props}
    />
  );
}
