"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getDealerWarrantySalesAction } from "@/lib/actions/dealer-warranty-sales";
import { DealerSaleRow, columns } from "./columns";

export default function DealerWarrantySalesListPage() {
  const router = useRouter();
  const [data, setData] = useState<DealerSaleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await getDealerWarrantySalesAction();
      if (!isMounted) return;
      if (result.status && Array.isArray(result.data)) {
        const mapped: DealerSaleRow[] = result.data.map(
          (s: {
            id: string;
            policyNumber: string;
            packageName?: string | null;
            planLevel?: string | null;
            warrantyPackage?: { name?: string; planLevel?: string } | null;
            customer?: { firstName: string; lastName: string } | null;
            warrantyPrice?: number | string | null;
            saleDate: string;
            status: string;
          }) => ({
            id: s.id,
            policyNumber: s.policyNumber,
            packageName: s.packageName || s.warrantyPackage?.name || "",
            planLevel: s.planLevel || s.warrantyPackage?.planLevel || "",
            customerName: s.customer
              ? `${s.customer.firstName} ${s.customer.lastName}`
              : "-",
            warrantyPrice: Number(s.warrantyPrice ?? 0),
            saleDate: s.saleDate,
            status: s.status,
          })
        );
        setData(mapped);
      } else {
        setData([]);
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Warranty Sales</h1>
        <p className="text-muted-foreground mt-2">
          View warranties sold to your customers
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        actionText="Add"
        toggleAction={() => router.push("/dealer/warranty-sales/create")}
        searchFields={[
          { key: "policyNumber", label: "id" },
          { key: "packageName", label: "Package" },
          { key: "customerName", label: "Customer" },
        ]}
      />
    </div>
  );
}
