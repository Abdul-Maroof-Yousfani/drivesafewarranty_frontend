import { getDealers } from "@/lib/actions/dealer";
import { DealersList } from "./dealers-list";
import { ListError } from "@/components/dashboard/list-error";

export const dynamic = "force-dynamic";

export default async function DealersListPage({
  searchParams,
}: {
  searchParams: Promise<{ newDealerId?: string }>;
}) {
  try {
    const { newDealerId } = await searchParams;
    const result = await getDealers();

    if (!result.status || !result.data) {
      return (
        <ListError
          title="Failed to load dealers"
          message={result.message || "Unable to fetch dealers. Please check your connection and try again."}
        />
      );
    }

    return (
      <DealersList
        initialDealers={result.data || []}
        newItemId={newDealerId}
      />
    );
  } catch (error) {
    console.error("Error in DealersListPage:", error);
    return (
      <ListError
        title="Failed to load dealers"
        message={error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}
      />
    );
  }
}

