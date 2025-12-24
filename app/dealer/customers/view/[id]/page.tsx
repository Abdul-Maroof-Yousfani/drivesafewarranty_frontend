import { notFound } from "next/navigation";
import { getDealerCustomerByIdAction } from "@/lib/actions/dealer-customer";
import { ListError } from "@/components/dashboard/list-error";
import { CustomerViewDealer } from "./customer-view";

export const dynamic = "force-dynamic";

export default async function DealerCustomerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    if (!id) {
      notFound();
    }
    const result = await getDealerCustomerByIdAction(id);
    if (!result.status) {
      if (result.message?.toLowerCase().includes("not found")) {
        notFound();
      }
      return (
        <ListError
          title="Failed to load customer"
          message={result.message || "Unable to fetch customer. Please try again."}
        />
      );
    }
    if (!result.data) {
      notFound();
    }
    return <CustomerViewDealer customer={result.data} />;
  } catch (error) {
    console.error("Error in DealerCustomerViewPage:", error);
    return (
      <ListError
        title="Failed to load customer"
        message={
          error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
        }
      />
    );
  }
}
