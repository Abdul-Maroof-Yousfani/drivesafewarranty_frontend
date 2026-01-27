"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditIcon, EyeIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Unified type for warranty sale row data
export type WarrantySaleRow = {
  id: string;
  policyNumber: string;
  packageName: string;
  planLevel?: string | null;
  customerName: string;
  vehicleInfo?: string;
  warrantyPrice: number;
  saleDate: string;
  status: string;
  // For admin: dealer info
  dealerName?: string;
};

// Factory function to create columns based on role
export function createWarrantySalesColumns(
  role: "admin" | "dealer"
): ColumnDef<WarrantySaleRow>[] {
  const basePath = role === "admin" ? "/super-admin" : "/dealer";

  const columns: ColumnDef<WarrantySaleRow>[] = [
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
      header: "Warranty Number",
      size: 240,
      cell: ({ row }) => {
        const val = row.getValue("policyNumber") as string;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[220px]">{val}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{val}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "packageName",
      header: "Package",
      size: 220,
      cell: ({ row }) => {
        const name = row.getValue("packageName") as string;
        const level = row.original.planLevel;
        const display = level ? `${name} (${level})` : name;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[200px]">{display}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{display}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      size: 220,
      cell: ({ row }) => {
        const val = row.getValue("customerName") as string;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[200px]">{val}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{val}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  // Admin sees vehicle column
  if (role === "admin") {
    columns.push({
      accessorKey: "vehicleInfo",
      header: "Vehicle",
      size: 200,
      cell: ({ row }) => {
        const text = row.getValue("vehicleInfo") as string || "N/A";
        return (
          <div className="truncate max-w-[200px]" title={text}>
            {text}
          </div>
        );
      },
    });
  }

  // Price column
  columns.push({
    accessorKey: "warrantyPrice",
    header: "Price",
    size: 120,
    cell: ({ row }) => {
      const price = Number(row.getValue("warrantyPrice"));
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(price);
      return formatted;
    },
  });

  // Date column
  columns.push({
    accessorKey: "saleDate",
    header: "Sale Date",
    size: 140,
    cell: ({ row }) => {
      const date = row.getValue("saleDate");
      if (!date) return "N/A";
      return format(new Date(date as string), "MMM d, yyyy");
    },
  });

  // Status column
  columns.push({
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
  });

  // Actions column - role-specific
  columns.push({
    id: "actions",
    header: "Actions",
    size: 120,
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${basePath}/warranty-sales/view/${sale.id}`}>
              <EyeIcon className="h-4 w-4" />
            </Link>
          </Button>
          {role === "admin" && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${basePath}/warranty-sales/edit/${sale.id}`}>
                <EditIcon className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      );
    },
  });

  return columns;
}
