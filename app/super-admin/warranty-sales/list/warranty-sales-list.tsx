"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { columns, dealerColumns } from "./columns";
import type { WarrantySale } from "@/lib/actions/warranty-sales";
import { deleteWarrantySaleAction } from "@/lib/actions/warranty-sales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const customerSales = initialSales.filter((sale) => !!sale.customer);
  const dealerSales = initialSales.filter((sale) => !!sale.dealer);

  return (
    <Tabs defaultValue="customer" className="w-full">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="customer">Customer Sales</TabsTrigger>
        <TabsTrigger value="dealer">Dealer Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="customer" className="mt-6">
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
      </TabsContent>

      <TabsContent value="dealer" className="mt-6">
        <DataTable
          columns={dealerColumns}
          data={dealerSales}
          actionText="Add"
          toggleAction={handleToggle}
          onMultiDelete={handleMultiDelete}
          searchFields={[
            { key: "policyNumber", label: "id" },
            { key: "warrantyPackage.name", label: "Package Name" },
            { key: "dealer.businessNameLegal", label: "Dealer Name" },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}
