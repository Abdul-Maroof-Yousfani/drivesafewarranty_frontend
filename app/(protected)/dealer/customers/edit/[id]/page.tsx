
import { notFound } from "next/navigation";
import { getDealerCustomerByIdAction } from "@/lib/actions/dealer-customer";
import { CustomerSharedForm } from "@/components/dashboard/customers/customer-shared-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!id) {
        notFound();
    }
    
    // Use dealer action
    const result = await getDealerCustomerByIdAction(id);

    if (!result.status || !result.data) {
        return <div>Customer not found</div>;
    }

    return <CustomerSharedForm role="dealer" customer={result.data} />;
}
