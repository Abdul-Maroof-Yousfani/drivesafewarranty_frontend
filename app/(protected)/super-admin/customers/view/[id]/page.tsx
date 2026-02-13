import { getCustomerById } from "@/lib/actions/customer";

import { notFound } from "next/navigation";
import { CustomerSharedView } from "@/components/dashboard/customers/customer-shared-view";
import { ListError } from "@/components/dashboard/list-error";


export const dynamic = "force-dynamic";

export default async function CustomerViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dealerId?: string }>;
}) {
  try {
    const { id } = await params;
    const { dealerId } = await searchParams;

    if (!id) {
      notFound();
    }

    const result = await getCustomerById(id, dealerId);

    if (!result.status) {
      if (result.message?.toLowerCase().includes("not found")) {
        notFound();
      }
      return (
        <ListError
          title="Failed to load customer"
          message={
            result.message ||
            "Unable to fetch customer. Please check your connection and try again."
          }
        />
      );
    }


    if (!result.data) {
      notFound();
    }

    console.log("CustomerViewPage data:", JSON.stringify(result.data, null, 2));
    return <CustomerSharedView customer={result.data} role="admin" />;
  } catch (error) {
    console.error("Error in CustomerViewPage:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      notFound();
    }

    return (
      <ListError
        title="Failed to load customer"
        message={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."
        }
      />
    );
  }
}
