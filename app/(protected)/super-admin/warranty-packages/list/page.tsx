"use client";

import DataTable from "@/components/common/data-table";
import { getColumns, WarrantyPackageRow } from "./columns";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWarrantyPackages } from "@/lib/actions/warranty-package";
import { useTransition } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, PauseCircle, Trash2, LayoutGrid } from "lucide-react";

export default function WarrantyPackagesListPage() {
  const router = useRouter();
  const [data, setData] = useState<WarrantyPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"active" | "inactive" | "deleted">("active");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const result = await getWarrantyPackagesAction({ 
        includeInactive: view === "inactive",
        includeDeleted: view === "deleted" 
      });
      if (!isMounted) return;

      if (result.status && Array.isArray(result.data)) {
        let list = result.data;
        
        // Frontend filtering for specific views
        if (view === "inactive") {
          list = list.filter((pkg: any) => pkg.status !== "active" && !pkg.deletedAt);
        } else if (view === "deleted") {
          list = list.filter((pkg: any) => pkg.deletedAt !== null);
        } else {
          // view === "active"
          list = list.filter((pkg: any) => pkg.status === "active" && !pkg.deletedAt);
        }

        const mapped: WarrantyPackageRow[] = list.map((pkg: any) => ({
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
          status: pkg.status || "active",
          deletedAt: pkg.deletedAt,
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
  }, [view, refreshKey]);

  const { user } = useAuth();
  const isDealer = user?.role === "dealer";

  if (loading) {
    return <ListSkeleton />;
  }

  const handleMultiDelete = (ids: string[]) => {
    startTransition(async () => {
      const result = await deleteWarrantyPackages(ids);
      if (result.status) {
        toast.success(result.message);
        triggerRefresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warranty Packages</h1>
          <p className="text-muted-foreground mt-2">
            Manage warranty package definitions
          </p>
        </div>
        <Tabs value={view} onValueChange={(val: any) => setView(val)} className="w-auto">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="inactive" className="gap-2">
              <PauseCircle className="h-4 w-4" />
              Inactive
            </TabsTrigger>
            <TabsTrigger value="deleted" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Deleted
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        columns={getColumns(triggerRefresh)}
        data={data}
        searchFields={[{ key: "name", label: "Name" }]}
        toggleAction={
          !isDealer
            ? () => router.push("/super-admin/warranty-packages/create")
            : undefined
        }
        actionText={!isDealer ? "Create Package" : undefined}
        onMultiDelete={!isDealer ? handleMultiDelete : undefined}
      />
    </div>
  );
}
