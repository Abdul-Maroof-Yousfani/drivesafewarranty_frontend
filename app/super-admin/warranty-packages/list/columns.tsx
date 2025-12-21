"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit } from "lucide-react";

export type WarrantyPackageRow = {
  id: string;
  name: string;
  description: string;
  context: "drive_safe" | "dealer" | "direct_customer";
  durationValue: number;
  durationUnit: "months" | "years";
  price: number;
  createdAt: string;
};

export const columns: ColumnDef<WarrantyPackageRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Package Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "context",
    header: "Context",
    cell: ({ row }) => {
      const context = row.getValue("context") as string;
      if (context === "drive_safe") return "Drive-Safe Website";
      if (context === "dealer") return "Dealer";
      if (context === "direct_customer") return "Direct Customer";
      return context;
    },
  },
  {
    accessorKey: "durationValue",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("durationValue") as number;
      const unit = row.original.durationUnit;
      const label = unit === "years" ? "Year" : "Month";
      return `${duration} ${label}${duration > 1 ? "s" : ""}`;
    },
  },
  {
    accessorKey: "price",
    header: "Base Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `£${price.toLocaleString()}`;
    },
  },
  {
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
        </div>
      );
    },
  },
];

