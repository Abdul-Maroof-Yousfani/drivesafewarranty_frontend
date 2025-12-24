"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit, ClipboardPlus } from "lucide-react";
import { HighlightText } from "@/components/common/data-table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type WarrantyPackageRow = {
  id: string;
  name: string;
  description: string;
  durationValue: number;
  durationUnit: "months" | "years";
  price: number;
  createdAt: string;
  featuresCount: number;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
};

export const columns: ColumnDef<WarrantyPackageRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
  {
    accessorKey: "name",
    header: "Package Name",
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <HighlightText text={name} className="truncate" />;
    },
  },
  {
    accessorKey: "featuresCount",
    header: "Features (count)",
    enableSorting: true,
    cell: ({ row }) => {
      const count = row.getValue("featuresCount") as number;
      return count ?? 0;
    },
  },
  {
    accessorKey: "price12Months",
    header: "12 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price12Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "price24Months",
    header: "24 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price24Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "price36Months",
    header: "36 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price36Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const pkg = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-packages/view/${pkg.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-packages/edit/${pkg.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/super-admin/warranty-sales/create?packageId=${pkg.id}`}
                  >
                    <ClipboardPlus className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assign to Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
