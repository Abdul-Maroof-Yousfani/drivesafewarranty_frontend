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
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Car,
  Calendar,
  ShieldCheck,
  Fuel,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsTab } from "@/app/shared/documents/documents-tab";
import { useDealerStatus } from "@/lib/hooks/use-dealer-status";
import { format, isValid } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CustomerSharedViewProps {
  customer: Customer;
  role: "admin" | "dealer";
}

export function CustomerSharedView({ customer, role }: CustomerSharedViewProps) {
  const router = useRouter();
  const { isInactive } = useDealerStatus();

  // Helper to safely format dates
  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "N/A";
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Customer data not available</p>
      </div>
    );
  }

  const editUrl = role === "admin" 
    ? `/super-admin/customers/edit/${customer.id}`
    : `/dealer/customers/edit/${customer.id}`;

  const showAdminFields = role === "admin";

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight break-all">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground mt-2 break-all">
            Customer ID: {customer.id}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            asChild={!isInactive} 
            className="flex-1 sm:flex-none"
            disabled={isInactive}
            variant={isInactive ? "secondary" : "default"}
          >
            {isInactive ? (
              <span className="flex items-center opacity-70">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </span>
            ) : (
              <Link href={editUrl}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                    <p className="text-sm text-muted-foreground break-all">
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {customer.address}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant={
                      customer.status === "active" ? "default" : "secondary"
                    }
                    className="mt-1"
                  >
                    {customer.status}
                  </Badge>
                </div>
                {showAdminFields && customer.dealerName && (
                  <div>
                    <p className="text-sm font-medium">Dealer</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {customer.dealerName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Vehicle details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    customer.vehicles.map((vehicle, index) => (
                      <div
                        key={vehicle.id || index}
                        className="space-y-4 pt-6 first:pt-0 border-t first:border-t-0"
                      >
                        {/* Header with Title & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold break-all">
                              <span>{vehicle.make} {vehicle.model}</span>
                              <span className="text-muted-foreground ml-2 text-sm font-normal shrink-0">
                                ({vehicle.year})
                              </span>
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            {vehicle.dvlaTaxStatus && (
                              <Badge
                                variant={
                                  vehicle.dvlaTaxStatus.toLowerCase() ===
                                  "taxed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                Tax: {vehicle.dvlaTaxStatus}
                              </Badge>
                            )}
                            {vehicle.dvlaMotStatus && (
                              <Badge
                                variant={
                                  vehicle.dvlaMotStatus.toLowerCase() ===
                                  "valid"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                MOT: {vehicle.dvlaMotStatus}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Primary Info Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Registration
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm font-medium tracking-wide break-all">
                                {vehicle.registrationNumber || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Mileage
                            </p>
                            <p className="text-sm font-medium">
                              {vehicle.mileage?.toLocaleString() ?? 0} km
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              VIN
                            </p>
                            <p
                              className="text-sm font-mono text-muted-foreground break-all"
                              title={vehicle.vin || ""}
                            >
                              {vehicle.vin || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Transmission
                            </p>
                            <p className="text-sm font-medium capitalize">
                              {vehicle.transmission || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Fuel Type
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-sm text-foreground">
                                {vehicle.dvlaFuelType || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Colour
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="h-3 w-3 rounded-full border bg-current"
                                style={{
                                  color:
                                    vehicle.dvlaColour?.toLowerCase() || "gray",
                                }}
                              />
                              <p className="text-sm text-foreground capitalize">
                                {vehicle.dvlaColour || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Specs Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value="technical-specs"
                            className="border-b-0"
                          >
                            <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground">
                              <span className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                View Technical Specifications
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="rounded-md bg-muted/40 p-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Engine Capacity:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaEngineCapacity
                                      ? `${vehicle.dvlaEngineCapacity} cc`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    CO2 Emissions:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaCo2Emissions
                                      ? `${vehicle.dvlaCo2Emissions} g/km`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    First Registered:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaMonthOfFirstRegistration ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Last V5C Issued:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaDateOfLastV5CIssued
                                      ? formatDate(vehicle.dvlaDateOfLastV5CIssued)
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Wheelplan:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaWheelplan || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Type Approval:
                                  </span>
                                  <span className="font-medium">
                                    {vehicle.dvlaTypeApproval || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Tax Due Date:
                                  </span>
                                  <span className="font-medium" suppressHydrationWarning>
                                    {vehicle.dvlaTaxDueDate
                                      ? formatDate(vehicle.dvlaTaxDueDate)
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    MOT Expiry:
                                  </span>
                                  <span className="font-medium" suppressHydrationWarning>
                                    {vehicle.dvlaMotExpiryDate
                                      ? formatDate(vehicle.dvlaMotExpiryDate)
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {customer.vehicleMake || customer.vehicleModel ? (
                        <>
                          <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Vehicle</p>
                              <p className="text-sm text-muted-foreground break-all">
                              <span>{customer.vehicleMake} {customer.vehicleModel}</span> (
                              {customer.vehicleYear})
                            </p>
                            </div>
                          </div>
                          {customer.vin && (
                            <div>
                              <p className="text-sm font-medium">VIN Number</p>
                              <p className="text-sm text-muted-foreground break-all">
                                {customer.vin}
                              </p>
                            </div>
                          )}
                          {customer.registrationNumber && (
                            <div>
                              <p className="text-sm font-medium">
                                Registration Number
                              </p>
                              <p className="text-sm text-muted-foreground break-all">
                                {customer.registrationNumber}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              Current Mileage
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.mileage
                                ? customer.mileage.toLocaleString()
                                : 0}{" "}
                              km
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          No vehicle information available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Warranty</CardTitle>
              <CardDescription>
                Active warranty details for this customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.currentWarranty ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Package</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {customer.currentWarranty.warrantyPackage.name}
                        {customer.currentWarranty.warrantyPackage.planLevel &&
                          ` (${customer.currentWarranty.warrantyPackage.planLevel})`}
                      </p>
                    </div>
                  </div>
                  {customer.currentWarranty.vehicle && (
                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Covered Vehicle</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {customer.currentWarranty.vehicle.make}{" "}
                          {customer.currentWarranty.vehicle.model} (
                          {customer.currentWarranty.vehicle.year})
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Warranty Number</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {customer.currentWarranty.policyNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coverage Start</p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {formatDate(customer.currentWarranty.coverageStartDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coverage End</p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {formatDate(customer.currentWarranty.coverageEndDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className="mt-1">
                      {customer.currentWarranty.status}
                    </Badge>
                  </div>
                  {typeof customer.currentWarranty.planMonths === "number" && (
                     <div>
                       <p className="text-sm font-medium">Plan</p>
                       <p className="text-sm text-muted-foreground">
                         {customer.currentWarranty.planMonths} Months
                       </p>
                     </div>
                   )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active warranty found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {showAdminFields && (
                    <div>
                    <p className="text-sm font-medium">Created By</p>
                    <p className="text-sm text-muted-foreground">
                        {customer.createdBy || "N/A"}
                    </p>
                    </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {customer.createdAt ? format(new Date(customer.createdAt), "MMMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
