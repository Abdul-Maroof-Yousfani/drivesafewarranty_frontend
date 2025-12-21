"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Building2, Mail, Phone, MapPin, User } from "lucide-react";
import Link from "next/link";
import { getDealerById } from "@/lib/actions/dealer";
import { toast } from "sonner";

export default function DealerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealer = async () => {
      if (!params.id) return;
      
      try {
        const result = await getDealerById(params.id as string);
        if (result.status && result.data) {
          setDealer(result.data);
        } else {
          toast.error(result.message || "Failed to fetch dealer details");
        }
      } catch (error) {
        console.error('Error fetching dealer:', error);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchDealer();
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

  if (!dealer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-xl text-muted-foreground">Dealer not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
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
                <p className="text-sm text-muted-foreground">{dealer.businessNameLegal || "N/A"}</p>
                {dealer.businessNameTrading && dealer.businessNameTrading !== dealer.businessNameLegal && (
                  <p className="text-xs text-muted-foreground">(Trading as: {dealer.businessNameTrading})</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{dealer.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{dealer.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{dealer.contactPersonName || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{dealer.businessAddress || "N/A"}</p>
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
              <p className="text-2xl font-bold">{dealer.totalCustomers || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Warranties Sold</p>
              <p className="text-2xl font-bold">{dealer.totalWarranties || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Amount Owed</p>
              <p className="text-2xl font-bold">${dealer.amountOwed || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  dealer.status === 'active'
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {dealer.status === 'active' ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

