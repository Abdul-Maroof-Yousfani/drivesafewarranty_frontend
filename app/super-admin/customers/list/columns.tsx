"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Edit, Eye, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  dealerName?: string | null;
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
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "vehicleMake",
    header: "Vehicle",
    cell: ({ row }) => {
      const make = row.getValue("vehicleMake") as string;
      const model = row.original.vehicleModel;
      const year = row.original.vehicleYear;
      const vehicleText = `${make} ${model} (${year})`;
      return (
        <div className="max-w-[200px] " title={vehicleText}>
          {vehicleText}
        </div>
      );
    },
    size: 250,
    minSize: 180,
    maxSize: 250,
  },
  {
    accessorKey: "dealerName",
    header: "Dealer",
    cell: ({ row }) => {
      const dealerName = row.getValue("dealerName") as string | null;
      const displayText = dealerName || "N/A";
      return (
        <div className="max-w-[140px] " title={dealerName || undefined}>
          {displayText}
        </div>
      );
    },
    size: 150,
    minSize: 130,
    maxSize: 180,
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center ">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/super-admin/customers/view/${customer.id}`}>
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
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/super-admin/customers/edit/${customer.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
                <TooltipContent>
                <p>Edit Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/super-admin/customers/delete/${customer.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Link>
                  </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
