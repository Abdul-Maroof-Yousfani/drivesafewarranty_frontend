"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/data-table";
import { columns } from "./columns";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getAllInvoicesAction, Invoice } from "@/lib/actions/invoices";
import { toast } from "sonner";

export default function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getAllInvoicesAction({ page: 1, limit: 100 });
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
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-2">
          View and manage invoices for dealers
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchFields={[
          { key: "invoiceNumber", label: "Invoice Number" },
        ]}
      />
    </div>
  );
}

