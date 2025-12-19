"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { DealerWarrantyPackageRow, dealerColumns } from "./columns";

export default function DealerWarrantyPackagesListPage() {
  const [data, setData] = useState<DealerWarrantyPackageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await getWarrantyPackagesAction();
      if (!isMounted) return;

      if (result.status && Array.isArray(result.data)) {
        const mapped: DealerWarrantyPackageRow[] = result.data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description || "",
          durationValue: pkg.durationValue,
          durationUnit: pkg.durationUnit,
          price: pkg.price ?? 0,
        }));
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
        <h1 className="text-3xl font-bold tracking-tight">My Warranty Packages</h1>
        <p className="text-muted-foreground mt-2">
          View warranty packages shared with your showroom and assign them to customers.
        </p>
      </div>

      <DataTable
        columns={dealerColumns}
        data={data}
        searchFields={[
          { key: "name", label: "Name" },
        ]}
        // Dealers cannot create or edit packages, so no primary action button
      />
    </div>
  );
}


