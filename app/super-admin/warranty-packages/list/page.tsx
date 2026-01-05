"use client";

import DataTable from "@/components/common/data-table";
import { columns, WarrantyPackageRow } from "./columns";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWarrantyPackages } from "@/lib/actions/warranty-package";
import { useTransition } from "react";
import { toast } from "sonner";

export default function WarrantyPackagesListPage() {
  const router = useRouter();
  const [data, setData] = useState<WarrantyPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await getWarrantyPackagesAction();
      if (!isMounted) return;

      if (result.status && Array.isArray(result.data)) {
        const mapped: WarrantyPackageRow[] = result.data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description || "",
          durationValue: pkg.durationValue,
          durationUnit: pkg.durationUnit,
          price: pkg.price ?? 0,
          createdAt: pkg.createdAt,
          featuresCount: pkg.items
            ?.filter((item: any) => item.type === "benefit").length || 0,
          price12Months: pkg.price12Months ?? null,
          price24Months: pkg.price24Months ?? null,
          price36Months: pkg.price36Months ?? null,
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

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      const result = await deleteWarrantyPackages(ids);
      if (result.status) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warranty Packages</h1>
        <p className="text-muted-foreground mt-2">
          Manage warranty package definitions
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchFields={[{ key: "name", label: "Name" }]}
        toggleAction={() =>
          router.push("/super-admin/warranty-packages/create")
        }
        actionText="Create Package"
        onMultiDelete={handleMultiDelete}
      />
    </div>
  );
}
