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
  Users,
  ShieldCheck,
  UserPlus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { getDealerById, type Dealer } from "@/lib/actions/dealer";
import { getCustomers, type Customer } from "@/lib/actions/customer";
import { toast } from "sonner";
import { format } from "date-fns";
import { getWarrantySalesAction, type WarrantySale } from "@/lib/actions/warranty-sales";

export default function DealerCustomersPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warranties, setWarranties] = useState<WarrantySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      const dealerId = params.id as string;

      try {
        const [dealerRes, customersRes, warrantiesRes] = await Promise.all([
          getDealerById(dealerId),
          getCustomers(dealerId),
          getWarrantySalesAction(dealerId),
        ]);

        if (dealerRes.status && dealerRes.data) {
          setDealer(dealerRes.data);
        } else {
          toast.error(dealerRes.message || "Failed to fetch dealer");
        }

        if (customersRes.status && customersRes.data) {
          setCustomers(customersRes.data);
        } else {
          toast.error(customersRes.message || "Failed to fetch customers");
        }

        if (warrantiesRes.status && warrantiesRes.data) {
          setWarranties(warrantiesRes.data);
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
    totalCustomers: customers.length,
    activeWarranties: warranties.filter(
      (w) => w.status === "active"
    ).length,
    recentAdds: customers.filter((c) => {
      const created = new Date(c.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-8 max-w-7xl mx-auto">
         <div className="h-8 w-64 bg-muted rounded" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <h1 className="text-2xl font-bold tracking-tight">Dealer Customers</h1>
          <p className="text-muted-foreground text-sm">
            Viewing customers for <span className="font-semibold text-foreground">{dealer.businessNameLegal}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warranties</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWarranties}</div>
            <p className="text-xs text-muted-foreground">
              Total active warranties
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAdds}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Warranty Package</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No customers found for this dealer.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{customer.email}</span>
                        <span className="text-muted-foreground">{customer.phone}</span>
                      </div>
                    </TableCell>
                      <TableCell>
                        {customer.currentWarranty?.warrantyPackage ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {customer.currentWarranty.warrantyPackage.name}
                              {customer.currentWarranty.warrantyPackage.planLevel && 
                                ` (${customer.currentWarranty.warrantyPackage.planLevel})`}
                            </span>
                            {customer.currentWarranty.planMonths && (
                              <span className="text-xs text-muted-foreground">
                                {customer.currentWarranty.planMonths} Months
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No Warranty</span>
                        )}
                      </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                       {format(new Date(customer.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" asChild>
                          <Link href={`/super-admin/customers/view/${customer.id}?dealerId=${params.id}`}>
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
