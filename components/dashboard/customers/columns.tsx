"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, ClipboardPlus, Edit, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type CustomerRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vin?: string | null;
  registrationNumber?: string | null;
  mileage?: number;
  dealerName?: string | null;
  vehicles?: any[]; // Allow flexibility for vehicles array
};

export const getColumns = (role: 'admin' | 'dealer'): ColumnDef<CustomerRow>[] => {
  const basePath = role === 'admin' ? '/super-admin' : '/dealer';

  return [
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
      accessorKey: "vehicleMake",
      header: "Vehicles",
      cell: ({ row }) => {
        const vehicles = row.original.vehicles;
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
        return (
          <div className="flex items-center ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`${basePath}/customers/view/${customer.id}`}>
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
                    <Link href={`${basePath}/customers/edit/${customer.id}`}>
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
                    <Link
                      href={`${basePath}/warranty-sales/create?customerId=${customer.id}`}
                    >
                      <ClipboardPlus className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assign Warranty Package</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];
};
