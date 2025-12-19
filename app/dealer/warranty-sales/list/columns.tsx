"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export type DealerSaleRow = {
  id: string;
  policyNumber: string;
  packageName: string;
  customerName: string;
  warrantyPrice: number;
  saleDate: string;
  status: string;
};

export const columns: ColumnDef<DealerSaleRow>[] = [
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
    accessorKey: "policyNumber",
    header: "Policy Number",
    size: 240,
  },
  {
    accessorKey: "packageName",
    header: "Package",
    size: 220,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    size: 220,
  },
  {
    accessorKey: "warrantyPrice",
    header: "Price",
    size: 120,
    cell: ({ row }) => {
      const price = Number(row.getValue("warrantyPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return formatted;
    },
  },
  {
    accessorKey: "saleDate",
    header: "Sale Date",
    size: 140,
    cell: ({ row }) => {
      return format(new Date(row.getValue("saleDate")), "MMM d, yyyy");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
];
