"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Building2, Mail, Phone, MapPin, User } from "lucide-react";
import Link from "next/link";

export default function DealerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dealer details from API
    // const fetchDealer = async () => {
    //   try {
    //     const response = await fetch(`/api/dealers/${params.id}`);
    //     const data = await response.json();
    //     setDealer(data);
    //   } catch (error) {
    //     console.error('Error fetching dealer:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchDealer();
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dealer Details</h1>
            <p className="text-muted-foreground mt-2">View dealer information and statistics</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/super-admin/dealers/edit/${params.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Dealer
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Dealer contact and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Dealer Name</p>
                <p className="text-sm text-muted-foreground">{dealer?.name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{dealer?.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{dealer?.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{dealer?.contactPerson || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{dealer?.address || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Dealer performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{dealer?.totalCustomers || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Warranties Sold</p>
              <p className="text-2xl font-bold">{dealer?.totalWarranties || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Amount Owed</p>
              <p className="text-2xl font-bold">${dealer?.amountOwed || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  dealer?.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {dealer?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

