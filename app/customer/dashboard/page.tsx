"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Calendar,
  FileText,
  Car,
  ArrowRight,
  CheckCircle2,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getCustomerWarrantySalesAction,
  CustomerWarrantySale,
} from "@/lib/actions/customer-warranties";
import { toast } from "sonner";
import { formatCurrency } from "@/app/shared/utils";

export default function CustomerDashboard() {
  const [warranties, setWarranties] = useState<CustomerWarrantySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchWarranties = async () => {
      try {
        const res = await getCustomerWarrantySalesAction();
        if (res.status && Array.isArray(res.data)) {
          // Filter warranties for the current customer if the API returns all
          // Assuming the API handles permission, but for safety we display what we get
          // If the API returns ALL sales (admin view), this would be a security issue
          // that should be fixed on backend. We will assume API returns correct data for user context.
          setWarranties(res.data);
        } else {
          toast.error(res.message || "Failed to load warranty information");
        }
      } catch (error) {
        console.error("Error fetching warranties:", error);
        toast.error("An error occurred while loading your dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchWarranties();
  }, []);

  const filteredWarranties = warranties.filter((warranty) => {
    const matchesSearch =
      warranty.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (warranty.packageName || warranty.warrantyPackage.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (warranty.dealer?.businessNameTrading || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || warranty.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeWarranty = warranties.find((w) => w.status === "active");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            My Warranty Coverage
          </h1>
          <p className="text-muted-foreground mt-2">
            View your warranty details, vehicle information, and coverage status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/customer/enquiries">Support</Link>
          </Button>
        </div>
      </div>

      {/* Main Status Card - Shows primary active warranty or summary */}
      {activeWarranty ? (
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Coverage
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <h2 className="text-2xl font-bold">
                      {activeWarranty.packageName || activeWarranty.warrantyPackage.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Warranty #: {activeWarranty.policyNumber}
                  </p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm text-muted-foreground">Coverage Start</p>
                <p className="font-medium">
                  {new Date(activeWarranty.saleDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50/50 to-background dark:from-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-lg font-bold">No Active Coverage Found</p>
                <p className="text-muted-foreground">
                  You currently don't have any active warranty packages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warranties List / Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">My Warranties</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {filteredWarranties.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              No warranties found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWarranties.map((warranty) => (
              <Card
                key={warranty.id}
                className="flex flex-col overflow-hidden transition-all hover:shadow-md border-t-4 border-t-primary/20"
              >
                <CardHeader className="pb-3 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {warranty.packageName || warranty.warrantyPackage.name}
                    </CardTitle>
                    <Badge
                      variant={
                        warranty.status === "active" ? "default" : "secondary"
                      }
                    >
                      {warranty.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Warranty #: {warranty.policyNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-4 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> Sale Date
                      </span>
                      <span className="font-medium">
                        {new Date(warranty.saleDate).toLocaleDateString()}
                      </span>
                    </div>
                    {warranty.vehicle && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Car className="h-3 w-3" /> Vehicle
                        </span>
                        <span
                          className="font-medium truncate max-w-[180px]"
                          title={`${warranty.vehicle.make} ${
                            warranty.vehicle.model
                          } ${warranty.vehicle.year}${
                            warranty.vehicle?.registrationNumber
                              ? ` • ${warranty.vehicle.registrationNumber}`
                              : ""
                          }`}
                        >
                          {warranty.vehicle.make} {warranty.vehicle.model}{" "}
                          {warranty.vehicle.year}
                        </span>
                      </div>
                    )}
                    {warranty.dealer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Car className="h-3 w-3" /> Dealer
                        </span>
                        <span
                          className="font-medium truncate max-w-[150px]"
                          title={
                            warranty.dealer.businessNameTrading ||
                            warranty.dealer.businessNameLegal
                          }
                        >
                          {warranty.dealer.businessNameTrading ||
                            warranty.dealer.businessNameLegal}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">
                        {formatCurrency(Number(warranty.warrantyPrice))}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button variant="outline" className="w-full group" asChild>
                    <Link href={`/invoices/${warranty.id}`} target="_blank">
                      View Invoice
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your warranty documents and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 hover:bg-muted/50 transition-colors"
              asChild
            >
              <Link href="/customer/invoices">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">View Invoices</p>
                    <p className="text-xs text-muted-foreground">
                      Download invoices for your warranties
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 hover:bg-muted/50 transition-colors"
              asChild
            >
              <Link href="/customer/enquiries">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Submit Enquiry</p>
                    <p className="text-xs text-muted-foreground">
                      Request service or support
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
