import { Suspense } from "react";
import { DirectPurchaseForm } from "./DirectPurchaseForm";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";

export default function DirectPurchasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Direct Customer Warranty Purchase
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete a warranty purchase for a new direct customer
        </p>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <DirectPurchaseForm />
      </Suspense>
    </div>
  );
}
