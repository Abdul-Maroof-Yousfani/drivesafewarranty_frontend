"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getDealers, Dealer } from "@/lib/actions/dealer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Eye,
  Loader2,
  Search,
  Edit,
  ShieldCheck,
  Calendar,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StatusToggle } from "@/components/ui/status-toggle";
import {
  toggleWarrantyAssignmentStatusAction,
} from "@/lib/actions/warranty-sales";
import DataTable from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { Suspense } from "react";

function AssignedWarrantiesContent() {
  const searchParams = useSearchParams();
  const urlDealerId = searchParams.get("dealerId");
  
  const [loadingSales, setLoadingSales] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>(urlDealerId || "all");

  useEffect(() => {
    loadDealers();
  }, []);

  useEffect(() => {
    if (selectedDealerId) {
      loadSales(selectedDealerId === "all" ? undefined : selectedDealerId);
    } else {
      setSales([]);
    }
  }, [selectedDealerId]);

  useEffect(() => {
    if (urlDealerId && urlDealerId !== selectedDealerId) {
      setSelectedDealerId(urlDealerId);
    }
  }, [urlDealerId]);

  const loadDealers = async () => {
    const res = await getDealers();
    if (res.status && res.data) {
      setDealers(res.data);
    }
  };

  const loadSales = async (dealerId?: string) => {
    setLoadingSales(true);
    const { getWarrantyAssignmentsAction } = await import("@/lib/actions/warranty-sales");
    const res = await getWarrantyAssignmentsAction(dealerId);
    
    if (res.status && res.data) {
      setSales(res.data);
    } else {
        setSales([]);
    }
    setLoadingSales(false);
  };

  const handleToggleAssignmentStatus = async (id: string) => {
    try {
      const res = await toggleWarrantyAssignmentStatusAction(id);
      if (res.status) {
        toast.success(res.message || "Status updated");
        setSales((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: s.status === "active" ? "inactive" : "active" }
              : s
          )
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
    {
      accessorKey: "id",
      header: "Assignment ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>
    },
    {
      accessorKey: "assignedAt",
      header: "Assignment Date",
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {new Date(row.original.assignedAt).toLocaleDateString()}
        </div>
      )
    },
    {
      id: "dealer",
      header: "Dealer",
      accessorFn: (row) => row.dealer?.businessNameLegal,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.dealer?.businessNameLegal}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.dealer?.email}
          </span>
        </div>
      )
    },
    {
      id: "package",
      header: "Package",
      accessorFn: (row) => row.warrantyPackage?.name,
      cell: ({ row }) => (
        <div className="flex items-center">
          <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
          {row.original.warrantyPackage?.name || "N/A"}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isPackageInactive = row.original.warrantyPackage?.status !== "active";
        
        return (
          <div className="flex flex-col gap-1">
            <StatusToggle
              checked={row.original.status === "active"}
              onCheckedChange={() => handleToggleAssignmentStatus(row.original.id)}
              disabled={isPackageInactive}
            />
            {isPackageInactive && (
              <span className="text-[9px] text-destructive font-bold uppercase tracking-tighter">
                Global Package Inactive
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dealerPrice12Months",
      header: "12m Dealer",
      cell: ({ row }) => formatCurrency(row.original.dealerPrice12Months)
    },
    {
      accessorKey: "dealerPrice24Months",
      header: "24m Dealer",
      cell: ({ row }) => formatCurrency(row.original.dealerPrice24Months)
    },
    {
      accessorKey: "dealerPrice36Months",
      header: "36m Dealer",
      cell: ({ row }) => formatCurrency(row.original.dealerPrice36Months)
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
            <Button asChild variant="ghost" size="icon" title="View Details">
            <Link href={`/super-admin/dealers/assigned-warranties/edit/${row.original.id}`}>
                <Eye className="h-4 w-4" />
            </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" title="Edit Assignment">
            <Link href={`/super-admin/dealers/assigned-warranties/edit/${row.original.id}?mode=edit`}>
                <Edit className="h-4 w-4" />
            </Link>
            </Button>
        </div>
      )
    },
  ],
  [sales]
);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warranties Assigned</h1>
        <p className="text-muted-foreground mt-2">
            View packages and warranties directly assigned to dealers.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dealer Assignments</CardTitle>
          <div className="flex items-center gap-4">
            <div className="w-[300px]">
              <Select
                value={selectedDealerId}
                onValueChange={setSelectedDealerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dealer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealers</SelectItem>
                  {dealers.map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.businessNameLegal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild>
              <Link href={`/super-admin/warranty-sales/create${selectedDealerId && selectedDealerId !== "all" ? `?dealerId=${selectedDealerId}` : ""}`}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Warranty
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedDealerId ? (
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium">No Dealer Selected</h3>
              <p className="mt-2 max-w-sm mx-auto">
                Please select a dealer from the dropdown above to view the packages
                assigned to them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingSales ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground border rounded-lg bg-slate-50/50">
                  No warranties found for this selection.
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={sales} 
                  searchFields={[
                    { key: "dealer", label: "Dealer" },
                    { key: "package", label: "Package" }
                  ]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssignedWarrantiesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    }>
      <AssignedWarrantiesContent />
    </Suspense>
  );
}

