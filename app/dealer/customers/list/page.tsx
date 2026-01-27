import { getDealerCustomersAction } from "@/lib/actions/dealer-customer";
import { CustomerSharedList } from "@/components/dashboard/customers/customer-shared-list";
import { ListError } from "@/components/dashboard/list-error";

export const dynamic = "force-dynamic";

export default async function DealerCustomersListPage({
  searchParams,
}: {
  searchParams: Promise<{ newItemId?: string }>;
}) {
  try {
    const { newItemId } = await searchParams;
    const result = await getDealerCustomersAction();

    if (!result.status || !result.data) {
      return (
        <ListError
          title="Failed to load customers"
          message={result.message || "Unable to fetch customers. Please check your connection and try again."}
        />
      );
    }

    return (
      <CustomerSharedList
        initialCustomers={result.data || []}
        newItemId={newItemId}
        role="dealer"
      />
    );
  } catch (error) {
    console.error("Error in DealerCustomersListPage:", error);
    return (
      <ListError
        title="Failed to load customers"
        message={error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}
      />
    );
  }
}
