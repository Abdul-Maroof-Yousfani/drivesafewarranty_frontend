"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, DollarSign, Receipt, Car, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDealerDashboardStatsAction } from "@/lib/actions/dashboard";

export default function DealerDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWarranties: 0,
    totalRevenue: 0,
    amountOwed: 0,
    profit: 0,
    pendingInvoices: 0,
    pendingInvoicesAmount: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getDealerDashboardStatsAction();
      if (!mounted) return;
      if (res.status && res.data) {
        const totalRevenue = res.data.totalRevenue ?? res.data.totalEarnings ?? 0;
        const pendingInvoicesAmount = res.data.pendingInvoicesAmount ?? 0;
        setStats({
          totalCustomers: res.data.totalCustomers,
          totalWarranties: res.data.totalWarranties,
          totalRevenue,
          amountOwed: res.data.amountOwed ?? pendingInvoicesAmount,
          profit: res.data.profit ?? 0,
          pendingInvoices: res.data.pendingInvoices,
          pendingInvoicesAmount,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Car className="h-8 w-8 text-primary" />
            Dealer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your warranty sales, customers, and business operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Customers</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warranty customers
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warranties Sold</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalWarranties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active warranty sales
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer sales value
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Owed</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{stats.amountOwed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding to Drive Safe
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{stats.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue minus invoices
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              £{stats.pendingInvoicesAmount.toLocaleString()} pending amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common dealer operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full justify-start" asChild>
              <Link href="/dealer/warranty-sales/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Warranty Sale
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dealer/customers/list">
                <Users className="mr-2 h-4 w-4" />
                View Customers
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dealer/invoices/list">
                <Receipt className="mr-2 h-4 w-4" />
                View Invoices
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dealer/settings">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Settings
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

