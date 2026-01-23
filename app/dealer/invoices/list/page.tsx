"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getDealerInvoicesAction, Invoice } from "@/lib/actions/invoices";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Download, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const dealerInvoiceColumns: ColumnDef<Invoice>[] = [
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
    accessorKey: "warrantySale",
    header: "Warranty Number",
    cell: ({ row }) => {
      const sale = row.original.warrantySale;
      return sale?.policyNumber || "N/A";
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

export default function DealerInvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getDealerInvoicesAction({ page: 1, limit: 100 });
        if (res.status && res.data) {
          setInvoices(res.data.invoices);
        } else {
          toast.error(res.message || "Failed to load invoices");
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground mt-2">
          View invoices generated for your showroom
        </p>
      </div>

      <DataTable
        columns={dealerInvoiceColumns}
        data={invoices}
        searchFields={[
          { key: "invoiceNumber", label: "Invoice Number" },
        ]}
      />
    </div>
  );
}

