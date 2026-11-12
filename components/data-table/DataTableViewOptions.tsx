"use client";

import { Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore, type TableId } from "@/stores/ui-store";

export interface ToggleableColumn {
  id: string;
  label: string;
}

/** Column visibility menu, backed by the persisted UI store. */
export function DataTableViewOptions({ tableId, columns }: { tableId: TableId; columns: ToggleableColumn[] }) {
  const visibility = useUiStore((s) => s.hiddenColumns[tableId]);
  const setVisibility = useUiStore((s) => s.setColumnVisibility);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden lg:inline-flex">
          <Columns3 aria-hidden />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibility?.[column.id] !== false}
            onCheckedChange={(checked) => setVisibility(tableId, { ...visibility, [column.id]: Boolean(checked) })}
            onSelect={(e) => e.preventDefault()}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
