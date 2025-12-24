"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getDealerWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { DealerWarrantyPackageRow, dealerColumns } from "./columns";
import { deleteDealerWarrantyPackages } from "@/lib/actions/warranty-package";
import { useTransition } from "react";
import { toast } from "sonner";

export default function DealerWarrantyPackagesListPage() {
  const [data, setData] = useState<DealerWarrantyPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await getDealerWarrantyPackagesAction();
      if (!isMounted) return;

      if (result.status && Array.isArray(result.data)) {
        const mapped: DealerWarrantyPackageRow[] = result.data.map(
          (pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || "",
            durationValue: pkg.durationValue,
            durationUnit: pkg.durationUnit,
            price: pkg.price ?? 0,
            price12Months: pkg.price12Months,
            price24Months: pkg.price24Months,
            price36Months: pkg.price36Months,
            featuresCount: Array.isArray(pkg.keyBenefits)
              ? pkg.keyBenefits.length
              : 0,
            status: pkg.status,
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

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      const result = await deleteDealerWarrantyPackages(ids);
      if (result.status) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          My Warranty Packages
        </h1>
        <p className="text-muted-foreground mt-2">
          View warranty packages shared with your showroom and assign them to
          customers.
        </p>
      </div>

      <DataTable
        columns={dealerColumns}
        data={data}
        searchFields={[{ key: "name", label: "Name" }]}
        onMultiDelete={handleMultiDelete}
        // Dealers cannot create or edit packages, so no primary action button
      />
    </div>
  );
}
