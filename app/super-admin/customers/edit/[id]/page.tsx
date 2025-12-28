
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/actions/customer";
import { ListError } from "@/components/dashboard/list-error";
import EditCustomerForm from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    try {
        const { id } = await params;
        if (!id) {
            notFound();
        }
        const result = await getCustomerById(id);
        if (!result.status || !result.data) {
            if (result.message?.toLowerCase().includes("not found")) {
                notFound();
            }
            return (
                <ListError
                    title="Failed to load customer"
                    message={result.message || "Unable to fetch customer."}
                />
            );
        }

        return <EditCustomerForm customer={result.data} />;
    } catch (error) {
        console.error("Error loading edit customer page:", error);
        return (
            <ListError
                title="Error"
                message="An unexpected error occurred."
            />
        );
    }
}
