import { getCustomerWarrantySalesAction } from "@/lib/actions/customer-warranties";
import { ShieldCheckIcon } from "lucide-react";
import { CustomerWarrantyCard } from "@/components/customer/warranties/customer-warranty-card";

export const dynamic = "force-dynamic";

export default async function CustomerWarrantiesPage() {
  const { status, data: warranties } = await getCustomerWarrantySalesAction();

  if (!status || !warranties || warranties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <ShieldCheckIcon className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          No Active Warranties Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          You don't have any warranty packages assigned yet. Please contact your
          dealer if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Warranties</h1>
        <p className="text-muted-foreground">
          View and manage your active warranty packages and coverage details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        {warranties.map((warranty) => (
          <CustomerWarrantyCard key={warranty.id} warranty={warranty} />
        ))}
      </div>
    </div>
  );
}
