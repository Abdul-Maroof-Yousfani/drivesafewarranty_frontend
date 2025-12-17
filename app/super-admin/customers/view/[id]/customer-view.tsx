"use client";

import { useRouter } from "next/navigation";
import { Customer } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Car, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CustomerViewProps {
  customer: Customer;
}

export function CustomerView({ customer }: CustomerViewProps) {
  const router = useRouter();

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Customer data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Customer ID: {customer.id}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={`/super-admin/customers/edit/${customer.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{customer.address}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={customer.status === "active" ? "default" : "secondary"} className="mt-1">
                {customer.status}
              </Badge>
            </div>
            {customer.dealerName && (
              <div>
                <p className="text-sm font-medium">Dealer</p>
                <p className="text-sm text-muted-foreground">{customer.dealerName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>Vehicle details and specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Vehicle</p>
                <p className="text-sm text-muted-foreground">
                  {customer.vehicleMake} {customer.vehicleModel} ({customer.vehicleYear})
                </p>
              </div>
            </div>
            {customer.vin && (
              <div>
                <p className="text-sm font-medium">VIN Number</p>
                <p className="text-sm text-muted-foreground">{customer.vin}</p>
              </div>
            )}
            {customer.registrationNumber && (
              <div>
                <p className="text-sm font-medium">Registration Number</p>
                <p className="text-sm text-muted-foreground">{customer.registrationNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Current Mileage</p>
              <p className="text-sm text-muted-foreground">{customer.mileage.toLocaleString()} km</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Created By</p>
              <p className="text-sm text-muted-foreground">{customer.createdBy || "N/A"}</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created At</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

