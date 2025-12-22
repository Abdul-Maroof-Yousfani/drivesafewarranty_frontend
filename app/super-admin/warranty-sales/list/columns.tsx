"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EditIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WarrantySale } from "@/lib/actions/warranty-sales";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<WarrantySale>[] = [
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
    header: "Sale ID",
    size: 260,
  },
  {
    id: "warrantyPackage.name",
    accessorFn: (row) => row.warrantyPackage?.name ?? "",
    header: "Package",
    size: 220,
  },
  {
    id: "soldTo",
    header: "Sold To",
    cell: ({ row }) => {
      const customer = row.original.customer;
      const dealer = row.original.dealer;
      if (customer) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      if (dealer) {
        return dealer.businessNameTrading || dealer.businessNameLegal;
      }
      return "N/A";
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
  {
    id: "buyerType",
    accessorFn: (row) =>
      row.customer ? "Customer" : row.dealer ? "Dealer" : "N/A",
    header: "Type",
    size: 120,
    cell: ({ row }) => {
      const type = row.getValue("buyerType") as string;
      return (
        <Badge variant={type === "N/A" ? "secondary" : "default"}>{type}</Badge>
      );
    },
  },
  {
    accessorKey: "Actions",
    id: "actions",
    size: 120,
    cell: ({ row }) => {
      const sale = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-sales/view/${sale.id}`}>
              <EyeIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-sales/edit/${sale.id}`}>
              <EditIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
