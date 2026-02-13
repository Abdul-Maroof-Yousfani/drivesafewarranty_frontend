"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  FileCheck,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { getDealerById, type Dealer } from "@/lib/actions/dealer";
import { getWarrantySalesAction, type WarrantySale } from "@/lib/actions/warranty-sales";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DealerWarrantiesPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [warranties, setWarranties] = useState<WarrantySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      const dealerId = params.id as string;

      try {
        const [dealerRes, warrantiesRes] = await Promise.all([
          getDealerById(dealerId),
          getWarrantySalesAction(dealerId),
        ]);

        if (dealerRes.status && dealerRes.data) {
          setDealer(dealerRes.data);
        } else {
          toast.error(dealerRes.message || "Failed to fetch dealer");
        }

        if (warrantiesRes.status && warrantiesRes.data) {
          setWarranties(warrantiesRes.data);
        } else {
          toast.error(warrantiesRes.message || "Failed to fetch warranties");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const stats = {
    totalSales: warranties.length,
    totalRevenue: warranties.reduce((sum, w) => sum + Number(w.warrantyPrice || 0), 0),
    activePolicies: warranties.filter((w) => w.status === "active").length,
    expiredPolicies: warranties.filter((w) => w.status === "expired" || w.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-8 max-w-7xl mx-auto">
         <div className="h-8 w-64 bg-muted rounded" />
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
         </div>
         <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-xl text-muted-foreground">Dealer not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dealer Warranties</h1>
          <p className="text-muted-foreground text-sm">
            Viewing warranty sales for <span className="font-semibold text-foreground">{dealer.businessNameLegal}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Warranties sold
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Generated revenue
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolicies}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired/Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredPolicies}</div>
            <p className="text-xs text-muted-foreground">
              Inactive sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warranties Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Warranty List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warranty Sale#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warranties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No warranty sales found for this dealer.
                  </TableCell>
                </TableRow>
              ) : (
                warranties.map((warranty) => (
                  <TableRow key={warranty.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {warranty.policyNumber}
                    </TableCell>
                    <TableCell>
                      {warranty.customer ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{warranty.customer.firstName} {warranty.customer.lastName}</span>
                          <span className="text-muted-foreground">{warranty.customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {warranty.vehicle ? (
                         <div className="text-xs">
                            <span className="font-medium">{warranty.vehicle.make} {warranty.vehicle.model}</span>
                            <span className="block text-muted-foreground">{warranty.vehicle.registrationNumber}</span>
                         </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                       {format(new Date(warranty.saleDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                       £{Number(warranty.warrantyPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge
                          variant={
                            warranty.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                             warranty.status === "active" 
                             ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                             : ""
                          }
                        >
                          {warranty.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" asChild>
                          <Link href={`/super-admin/warranty-sales/view/${warranty.id}?dealerId=${params.id}`}>
                             <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
