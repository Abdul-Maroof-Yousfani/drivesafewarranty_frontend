"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DataTable from "@/components/common/data-table";
import { columns, CustomerRow } from "./columns";
import {
  Customer,
  deleteCustomers,
} from "@/lib/actions/customer";
import { toast } from "sonner";

interface CustomerListProps {
  initialCustomers: Customer[];
  newItemId?: string;
}

export function CustomerList({
  initialCustomers,
  newItemId,
}: CustomerListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    router.push("/dealer/customers/create");
  };

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      const result = await deleteCustomers(ids);
      if (result.status) {
        toast.success(result.message || `${ids.length} customer(s) deleted successfully`);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete customers");
      }
    });
  };

  // Transform data to include string id and formatted name for DataTable
  const data: CustomerRow[] = initialCustomers.map((customer) => ({
    ...customer,
    id: customer.id.toString(),
    name: `${customer.firstName} ${customer.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Customers</h2>
        <p className="text-muted-foreground">
          Manage customers who purchased warranty through your showroom
        </p>
      </div>

      <DataTable<CustomerRow>
        columns={columns}
        data={data}
        actionText="Add Customer"
        toggleAction={handleToggle}
        newItemId={newItemId}
        searchFields={[
          { key: "name", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "vehicleMake", label: "Vehicle Make" },
        ]}
        onMultiDelete={handleMultiDelete}
      />
    </div>
  );
}

