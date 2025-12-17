"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit } from "lucide-react";

export type WarrantyPackage = {
  id: string;
  name: string;
  type: "Silver" | "Gold" | "Platinum";
  duration: number; // in years
  coverage: string;
  price: number;
  createdAt: string;
};

export const columns: ColumnDef<WarrantyPackage>[] = [
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
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return `${duration} Year${duration > 1 ? "s" : ""}`;
    },
  },
  {
    accessorKey: "price",
    header: "Base Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `$${price.toLocaleString()}`;
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

