import { getWarrantySalesAction } from "@/lib/actions/warranty-sales";
import { WarrantySalesSharedList } from "@/components/dashboard/warranty-sales/warranty-sales-shared-list";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export default async function WarrantySalesListPage() {
  const response = await getWarrantySalesAction();
  const data = response.data || [];
  const hasError = response.status === false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warranty Sales</h1>
        <p className="text-muted-foreground mt-2">
        List of Warranty Packages sold to customers
        </p>
      </div>
      {hasError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {response.message || "Failed to load warranty sales"}
        </div>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <WarrantySalesSharedList role="admin" initialSales={data} />
      </Suspense>
    </div>
  );
}

