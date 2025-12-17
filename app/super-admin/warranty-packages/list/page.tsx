"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/data-table";
import { columns } from "./columns";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";

export default function WarrantyPackagesListPage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch packages from API
    setLoading(false);
  }, []);

  if (loading) {
    return <ListSkeleton />;
  }

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
        data={packages}
        searchFields={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
        ]}
        toggleAction={() => router.push("/super-admin/warranty-packages/create")}
        actionText="Create Package"
      />
    </div>
  );
}

