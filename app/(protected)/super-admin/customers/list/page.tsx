import { getCustomers } from "@/lib/actions/customer";
import { CustomerSharedList } from "@/components/dashboard/customers/customer-shared-list";
import { ListError } from "@/components/dashboard/list-error";

export const dynamic = "force-dynamic";

export default async function CustomersListPage({
  searchParams,
}: {
  searchParams: Promise<{ newItemId?: string }>;
}) {
  try {
    const { newItemId } = await searchParams;
    const result = await getCustomers();

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
        role="admin"
      />
    );
  } catch (error) {
    console.error("Error in CustomersListPage:", error);
    return (
      <ListError
        title="Failed to load customers"
        message={error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}
      />
    );
  }
}

