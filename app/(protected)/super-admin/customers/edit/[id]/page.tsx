
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/actions/customer";
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
    const result = await getCustomerById(id);

    if (!result.status || !result.data) {
        return <div>Customer not found</div>;
    }

    return <CustomerSharedForm role="admin" customer={result.data} />;
}
