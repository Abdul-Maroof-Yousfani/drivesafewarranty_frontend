"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { columns, DealerRow } from "./columns";
import { Dealer } from "@/lib/actions/dealer";
import { deleteDealer } from "@/lib/actions/dealer";

interface DealersListProps {
  initialDealers: Dealer[];
  newItemId?: string;
}

export function DealersList({
  initialDealers,
  newItemId,
}: DealersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    router.push("/super-admin/dealers/create");
  };

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      for (const id of ids) {
        const result = await deleteDealer(id);
        if (!result.status) {
          toast.error(result.message || `Failed to delete dealer ${id}`);
          return;
        }
      }
      toast.success(`${ids.length} dealer(s) deleted successfully`);
      router.refresh();
    });
  };

  // Transform data for DataTable
  const data: DealerRow[] = initialDealers.map((dealer) => ({
    id: dealer.id,
    businessName: dealer.businessNameLegal,
    tradingName: dealer.businessNameTrading || dealer.businessNameLegal,
    email: dealer.email,
    phone: dealer.phone,
    contactPerson: dealer.contactPersonName,
    status: dealer.status,
    databaseName: dealer.databaseName,
    username: dealer.username,
    createdAt: dealer.createdAt,
    excelFilePath: dealer.excelFilePath || undefined,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dealers</h2>
        <p className="text-muted-foreground">
          Manage showroom partners and their information
        </p>
      </div>

      <DataTable<DealerRow>
        columns={columns}
        data={data}
        actionText="Add Dealer"
        toggleAction={handleToggle}
        newItemId={newItemId}
        searchFields={[
          { key: "businessName", label: "Business Name" },
          { key: "tradingName", label: "Trading Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "contactPerson", label: "Contact Person" },
        ]}
        onMultiDelete={handleMultiDelete}
      />
    </div>
  );
}

