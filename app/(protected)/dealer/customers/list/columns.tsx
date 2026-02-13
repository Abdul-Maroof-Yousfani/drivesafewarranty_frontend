"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, ClipboardPlus, Edit, Eye, Package, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDealerStatus } from "@/lib/hooks/use-dealer-status";
import { cn } from "@/lib/utils";

export type CustomerRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
};

export const columns: ColumnDef<CustomerRow>[] = [
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
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 200,
    cell: ({ row }) => {
      const val = row.getValue("name") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[180px]">{val}</div>
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const val = row.getValue("email") as string;
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
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "vehicleMake", // Keep accessorKey for potential sorting/filtering keys, though we are changing display
    header: "Vehicles",
    cell: ({ row }) => {
      const vehicles = (row.original as any).vehicles;
      const count = vehicles?.length || 0;
      const vehicleText = `${count} Vehicle${count !== 1 ? "s" : ""}`;

      return (
        <div className="font-medium">
          {vehicleText}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      const { isInactive, loading } = useDealerStatus();
      const isActionDisabled = isInactive || loading;
      
      return (
        <div className="flex items-center ">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dealer/customers/view/${customer.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild={!isActionDisabled} 
                  disabled={isActionDisabled}
                  className={cn(isActionDisabled && "opacity-50 cursor-not-allowed")}
                >
                  {isActionDisabled ? (
                    <Edit className="h-4 w-4" />
                  ) : (
                    <Link href={`/dealer/customers/edit/${customer.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isActionDisabled ? "Editing disabled (Inactive)" : "Edit Customer"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild={!isActionDisabled} 
                  disabled={isActionDisabled}
                  className={cn(isActionDisabled && "opacity-50 cursor-not-allowed")}
                >
                  {isActionDisabled ? (
                    <ClipboardPlus className="h-4 w-4" />
                  ) : (
                    <Link href={`/dealer/warranty-sales/create?customerId=${customer.id}`}>
                      <ClipboardPlus className="h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isActionDisabled ? "Assignment disabled (Inactive)" : "Assign Warranty Package"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

