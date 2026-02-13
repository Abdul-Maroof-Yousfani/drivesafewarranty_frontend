"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, ClipboardPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { EditPackagePriceDialog } from "@/components/dealer/edit-package-price-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDealerStatus } from "@/lib/hooks/use-dealer-status";
import { cn } from "@/lib/utils";

export type DealerWarrantyPackageRow = {
  id: string;
  name: string;
  description: string;
  durationValue: number;
  durationUnit: "months" | "years";
  price: number;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  featuresCount: number;
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
    accessorKey: "featuresCount",
    header: "Features",
    size: 100,
    cell: ({ row }) => {
      const count = row.getValue("featuresCount") as number;
      return <div className="text-center font-medium">{count}</div>;
    },
  },
  {
    accessorKey: "price12Months",
    header: "12 Months",
    size: 120,
    cell: ({ row }) => {
      const price = row.getValue("price12Months") as number | null;
      if (price === null || price === undefined) return "-";
      return `£${price.toLocaleString()}`;
    },
  },
  {
    accessorKey: "price24Months",
    header: "24 Months",
    size: 120,
    cell: ({ row }) => {
      const price = row.getValue("price24Months") as number | null;
      if (price === null || price === undefined) return "-";
      return `£${price.toLocaleString()}`;
    },
  },
  {
    accessorKey: "price36Months",
    header: "36 Months",
    size: 120,
    cell: ({ row }) => {
      const price = row.getValue("price36Months") as number | null;
      if (price === null || price === undefined) return "-";
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
    accessorKey: "Actions", 
    id: "actions",
    cell: ({ row }) => {
      const pkg = row.original;
      const { isInactive, loading } = useDealerStatus();
      const isActionDisabled = isInactive || loading;

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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    asChild={pkg.status === "active" && !isActionDisabled}
                    disabled={pkg.status !== "active" || isActionDisabled}
                    className={cn(isActionDisabled && "opacity-50 cursor-not-allowed")}
                  >
                    {pkg.status === "active" && !isActionDisabled ? (
                      <Link href={`/dealer/warranty-sales/create?packageId=${pkg.id}`}>
                        <ClipboardPlus className="h-4 w-4" />
                      </Link>
                    ) : (
                      <ClipboardPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isActionDisabled 
                    ? "Assignment disabled (Inactive)" 
                    : pkg.status === "active" 
                      ? "Assign to Customer" 
                      : "Package Inactive - Contact Admin"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    size: 120,
  },
];


