"use client";

import { useRouter } from "next/navigation";
import { useTransition, useMemo } from "react";
import DataTable from "@/components/common/data-table";
import { CustomerRow, getColumns } from "./columns";
import {
  Customer,
  deleteCustomers,
} from "@/lib/actions/customer";
import { toast } from "sonner";
import { useDealerStatus } from "@/lib/hooks/use-dealer-status";

interface CustomerSharedListProps {
  initialCustomers: Customer[];
  newItemId?: string;
  role: 'admin' | 'dealer';
}

export function CustomerSharedList({
  initialCustomers,
  newItemId,
  role
}: CustomerSharedListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isInactive } = useDealerStatus();

  const handleToggle = () => {
    if (isInactive && role === 'dealer') {
      toast.error("Your account is in view-only mode. Please contact the administrator.");
      return;
    }
    const basePath = role === 'admin' ? '/super-admin' : '/dealer';
    router.push(`${basePath}/customers/create`);
  };

  const handleMultiDelete = (role === 'admin' || (role === 'dealer' && !isInactive))
    ? (ids: string[]) => {
        if (isInactive && role === 'dealer') {
          toast.error("Your account is in view-only mode.");
          return;
        }
        startTransition(async () => {
          const result = await deleteCustomers(ids);
          if (result.status) {
            toast.success(result.message || `${ids.length} customer(s) deleted successfully`);
            router.refresh();
          } else {
            toast.error(result.message || "Failed to delete customers");
          }
        });
      }
    : undefined;

  const data: CustomerRow[] = initialCustomers.map((customer) => ({
    ...customer,
    id: customer.id.toString(),
    name: `${customer.firstName} ${customer.lastName}`,
    vehicleMake: customer.vehicleMake || "",
    vehicleModel: customer.vehicleModel || "",
    vehicleYear: customer.vehicleYear || 0,
  }));

  const columns = useMemo(() => getColumns(role), [role]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
            {role === 'admin' ? 'Customers' : 'My Customers'}
        </h2>
        <p className="text-muted-foreground">
            {role === 'admin' ? 'Manage warranty customers and their information' : 'Manage customers who purchased warranty through your showroom'}
        </p>
      </div>

      <DataTable<CustomerRow>
        columns={columns}
        data={data}
        actionText="Add Customer"
        toggleAction={handleToggle}
        toggleDisabled={isInactive && role === 'dealer'}
        newItemId={newItemId}
        searchFields={[
          { key: "name", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "vehicleMake", label: "Vehicle Make" },
        ]}
        onMultiDelete={handleMultiDelete}
      />
    </div>
  );
}
