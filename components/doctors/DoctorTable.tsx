"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Stethoscope, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { formatDate, formatNumber, initials } from "@/lib/format";
import type { Doctor, Pagination } from "@/lib/types";

export const DOCTOR_TOGGLEABLE_COLUMNS = [
  { id: "hospital", label: "Hospital" },
  { id: "phone", label: "Phone" },
  { id: "patients", label: "Patients" },
  { id: "createdAt", label: "Registered" },
];

interface DoctorTableProps {
  data: Doctor[] | undefined;
  pagination?: Pagination;
  isLoading: boolean;
  isFetching: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  toolbar?: React.ReactNode;
}

const RowActions = memo(function RowActions({
  doctor,
  onEdit,
  onDelete,
}: {
  doctor: Doctor;
  onEdit: (d: Doctor) => void;
  onDelete: (d: Doctor) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${doctor.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/doctors/${doctor.id}`}>
            <Eye aria-hidden /> View patients
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(doctor)}>
          <Pencil aria-hidden /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(doctor)}>
          <Trash2 aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function DoctorTable({ onEdit, onDelete, hasFilters, onClearFilters, ...props }: DoctorTableProps) {
  // Stable column definitions: rows only re-render when their data changes.
  const columns = useMemo<ColumnDef<Doctor>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
        cell: ({ row }) => {
          const d = row.original;
          return (
            <Link href={`/doctors/${d.id}`} className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials(d.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium group-hover:text-primary group-hover:underline">{d.name}</p>
                <p className="truncate text-xs text-muted-foreground">{d.email}</p>
              </div>
            </Link>
          );
        },
      },
      {
        id: "specialization",
        accessorKey: "specialization",
        enableSorting: false,
        header: "Specialization",
        meta: { className: "hidden sm:table-cell" },
        cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
      },
      {
        id: "hospital",
        accessorKey: "hospital",
        enableSorting: false,
        header: "Hospital",
        meta: { className: "hidden lg:table-cell max-w-56", label: "Hospital" },
        cell: ({ getValue }) => <span className="block truncate">{getValue<string>()}</span>,
      },
      {
        id: "phone",
        accessorKey: "phone",
        enableSorting: false,
        header: "Phone",
        meta: { className: "hidden xl:table-cell whitespace-nowrap", label: "Phone" },
      },
      {
        id: "patients",
        accessorKey: "patientCount",
        enableSorting: false,
        header: () => <span className="block text-right">Patients</span>,
        meta: { className: "hidden md:table-cell", label: "Patients" },
        cell: ({ getValue }) => {
          const count = getValue<number | null>();
          return (
            <span className="block text-right tabular-nums" title={count === null ? "Patient service unavailable" : undefined}>
              {count === null ? "—" : formatNumber(count)}
            </span>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
        meta: { className: "hidden md:table-cell whitespace-nowrap", label: "Registered" },
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => <RowActions doctor={row.original} onEdit={onEdit} onDelete={onDelete} />,
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      tableId="doctors"
      caption="Doctors"
      columns={columns}
      getRowId={(d) => d.id}
      emptyState={
        hasFilters ? (
          <EmptyState
            title="No doctors match your filters"
            description="Try a different search term or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState icon={Stethoscope} title="No doctors yet" description="Add your first doctor to start tracking patients." />
        )
      }
      {...props}
    />
  );
}
