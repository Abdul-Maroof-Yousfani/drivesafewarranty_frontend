"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Download, Eye } from "lucide-react";
import { Invoice } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "dealer",
    header: "Dealer",
    cell: ({ row }) => {
      const dealer = row.original.dealer;
      return dealer
        ? dealer.businessNameTrading || dealer.businessNameLegal
        : "N/A";
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = Number(row.getValue("totalAmount"));
      return formatCurrency(amount);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, string> = {
        paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      };
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || ""}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => {
      const date = row.getValue("invoiceDate") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/invoices/${invoice.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/invoices/${invoice.id}`}>
              <Download className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

