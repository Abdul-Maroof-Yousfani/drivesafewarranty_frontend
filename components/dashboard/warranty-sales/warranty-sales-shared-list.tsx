"use client";

import { useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { createWarrantySalesColumns, WarrantySaleRow } from "./warranty-sales-columns";

// Actions for each portal
import { getWarrantySalesAction, deleteWarrantySaleAction, WarrantySale } from "@/lib/actions/warranty-sales";
import { getDealerWarrantySalesAction } from "@/lib/actions/dealer-warranty-sales";

interface WarrantySalesSharedListProps {
  role: "admin" | "dealer";
  // For server-side fetched data (optional)
  initialSales?: WarrantySale[];
}

export function WarrantySalesSharedList({ role, initialSales }: WarrantySalesSharedListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<WarrantySaleRow[]>([]);
  const [loading, setLoading] = useState(!initialSales);

  const basePath = role === "admin" ? "/super-admin" : "/dealer";
  const columns = createWarrantySalesColumns(role);

  // Map raw sale data to unified row format
  const mapSaleToRow = (sale: any): WarrantySaleRow => {
    const packageName = sale.packageName || sale.warrantyPackage?.name || "";
    const planLevel = sale.planLevel || sale.warrantyPackage?.planLevel || null;
    
    let customerName = "-";
    if (sale.customer) {
      customerName = `${sale.customer.firstName} ${sale.customer.lastName}`;
    }

    let vehicleInfo = "N/A";
    if (sale.vehicle) {
      vehicleInfo = `${sale.vehicle.make} ${sale.vehicle.model} (${sale.vehicle.year})`;
    } else if (sale.vehicleId) {
      vehicleInfo = `Vehicle ID: ${sale.vehicleId.slice(0, 8)}`;
    }

    return {
      id: sale.id,
      policyNumber: sale.policyNumber,
      packageName,
      planLevel,
      customerName,
      vehicleInfo,
      warrantyPrice: Number(sale.warrantyPrice ?? 0),
      saleDate: sale.saleDate,
      status: sale.status,
      dealerName: sale.dealer?.businessNameLegal,
    };
  };

  // Load data on mount if not provided via initialSales
  useEffect(() => {
    if (initialSales) {
      // Filter only customer sales, map to row format
      const customerSales = initialSales.filter((sale) => !!sale.customer);
      setData(customerSales.map(mapSaleToRow));
      return;
    }

    let isMounted = true;
    (async () => {
      setLoading(true);
      let result;
      if (role === "admin") {
        result = await getWarrantySalesAction();
      } else {
        result = await getDealerWarrantySalesAction();
      }

      if (!isMounted) return;

      if (result.status && Array.isArray(result.data)) {
        const customerSales = result.data.filter((s: any) => !!s.customer || !!s.customerId);
        setData(customerSales.map(mapSaleToRow));
      } else {
        setData([]);
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [role, initialSales]);

  const handleToggle = () => {
    router.push(`${basePath}/warranty-sales/create`);
  };

  const handleMultiDelete = role === "admin" 
    ? (ids: string[]) => {
        startTransition(async () => {
          for (const id of ids) {
            const result = await deleteWarrantySaleAction(id);
            if (!result.status) {
              toast.error(result.message || `Failed to delete sale ${id}`);
              return;
            }
          }
          toast.success(`${ids.length} sale(s) deleted successfully`);
          router.refresh();
        });
      }
    : undefined;

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        actionText="Add"
        toggleAction={handleToggle}
        onMultiDelete={handleMultiDelete}
        searchFields={[
          { key: "policyNumber", label: "Warranty Number" },
          { key: "packageName", label: "Package" },
          { key: "customerName", label: "Customer" },
        ]}
      />
    </div>
  );
}
