"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { columns } from "./columns";
import type { WarrantySale } from "@/lib/actions/warranty-sales";
import { deleteWarrantySaleAction } from "@/lib/actions/warranty-sales";

export function WarrantySalesList({ initialSales }: { initialSales: WarrantySale[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    router.push("/super-admin/warranty-sales/create");
  };

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      for (const id of ids) {
        const result = await deleteWarrantySaleAction(id);
        if (!result.status) {
          toast.error(result.message || `Failed to delete sale ${id}`);
          return;
        }
      }
      toast.success(`${ids.length} sale(s) deleted successfully`);
      router.refresh();
    });
  };

  // Filter out direct dealer assignments, show only customer sales
  const customerSales = initialSales.filter((sale) => !!sale.customer);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={customerSales}
        actionText="Add"
        toggleAction={handleToggle}
        onMultiDelete={handleMultiDelete}
        searchFields={[
          { key: "policyNumber", label: "id" },
          { key: "warrantyPackage.name", label: "Package Name" },
          { key: "customer.firstName", label: "Customer Name" },
        ]}
      />
    </div>
  );
}
