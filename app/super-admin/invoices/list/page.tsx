"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/data-table";
import { columns } from "./columns";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";

export default function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch invoices from API
    setLoading(false);
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
          { key: "dealerName", label: "Dealer Name" },
        ]}
        toggleAction={() => router.push("/super-admin/invoices/generate")}
        actionText="Generate Invoice"
      />
    </div>
  );
}

