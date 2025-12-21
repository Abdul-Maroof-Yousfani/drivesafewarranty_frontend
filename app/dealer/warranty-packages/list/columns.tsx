"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, ClipboardPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { EditPackagePriceDialog } from "@/components/dealer/edit-package-price-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type DealerWarrantyPackageRow = {
  id: string;
  name: string;
  description: string;
  durationValue: number;
  durationUnit: "months" | "years";
  price: number;
  status: string;
};

export const dealerColumns: ColumnDef<DealerWarrantyPackageRow>[] = [
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
    size: 250,
  },
  {
    accessorKey: "durationValue",
    header: "Duration",
    size: 140,
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
    size: 140,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      if (!price) return "-";
      return `£${price.toLocaleString()}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pkg = row.original;
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dealer/warranty-packages/view/${pkg.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <EditPackagePriceDialog 
            packageId={pkg.id} 
            currentPrice={pkg.price} 
            packageName={pkg.name} 
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dealer/warranty-sales/create?packageId=${pkg.id}`}>
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
    size: 120,
  },
];


