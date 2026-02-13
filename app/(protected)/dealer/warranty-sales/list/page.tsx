import { WarrantySalesSharedList } from "@/components/dashboard/warranty-sales/warranty-sales-shared-list";

export default function DealerWarrantySalesListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Warranty Sales</h1>
        <p className="text-muted-foreground mt-2">
          View warranties sold to your customers
        </p>
      </div>

      <WarrantySalesSharedList role="dealer" />
    </div>
  );
}
