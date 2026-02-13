
import { CustomerSharedForm } from "@/components/dashboard/customers/customer-shared-form";

export const dynamic = "force-dynamic";

export default function CreateCustomerPage() {
  return <CustomerSharedForm role="admin" />;
}
