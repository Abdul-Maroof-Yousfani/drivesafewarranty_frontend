"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { columns, type PlanLevelRow } from "./columns";
import {
  getWarrantyPlanLevelsAction,
  deleteWarrantyPlanLevelsAction,
  type WarrantyPlanLevel,
} from "@/lib/actions/warranty-plan-level";

export default function WarrantyPlanLevelsListPage() {
  const router = useRouter();
  const [data, setData] = useState<PlanLevelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      const res = await deleteWarrantyPlanLevelsAction(ids);
      if (res.status) {
        toast.success(res.message);
        router.refresh();
        // Manually update data state to reflect deletion immediately if refresh takes time
        setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      } else {
        toast.error(res.message || "Failed to delete plan levels");
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await getWarrantyPlanLevelsAction();
      if (!isMounted) return;

      if (res.status && Array.isArray(res.data)) {
        const mapped: PlanLevelRow[] = res.data.map((level: WarrantyPlanLevel) => ({
          id: level.id,
          name: level.name,
          description: level.description || "",
          benefitsCount: level.benefits?.length || 0,
        }));
        setData(mapped);
      } else {
        toast.error(res.message || "Failed to load plan levels");
        setData([]);
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || isPending) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Warranty Plan Levels
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage dynamic warranty plan levels (e.g. Silver, Gold, Platinum) and
          their default benefits.
        </p>
      </div>

      <DataTable<PlanLevelRow>
        columns={columns}
        data={data}
        searchFields={[{ key: "name", label: "Name" }]}
        toggleAction={() =>
          router.push("/super-admin/warranty-plan-levels/create")
        }
        actionText="Create Plan Level"
        onMultiDelete={handleMultiDelete}
      />
    </div>
  );
}


