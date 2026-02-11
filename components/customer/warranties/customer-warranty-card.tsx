"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircle2Icon,
  FileTextIcon,
  MailIcon,
  PhoneIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toggleMyWarrantyStatusAction } from "@/lib/actions/customer-warranties";
import { cn } from "@/lib/utils";

interface CustomerWarrantyCardProps {
  warranty: any;
}

export function CustomerWarrantyCard({ warranty }: CustomerWarrantyCardProps) {
  const [status, setStatus] = useState(warranty.status);
  const [loading, setLoading] = useState(false);

  const startDate = new Date(warranty.coverageStartDate).toLocaleDateString();
  const endDate = new Date(warranty.coverageEndDate).toLocaleDateString();
  
  const isExpired = new Date(warranty.coverageEndDate) <= new Date();
  const isInactive = status !== "active";
  const isActive = !isInactive && !isExpired;

  const displayStatus = isInactive ? "Inactive" : (isExpired ? "Expired" : "Active");
  const statusVariant = isActive ? "default" : "destructive";

  const handleToggleStatus = async () => {
    if (isInactive) {
       // Reactivation might require admin intervention, but the requirement says "Toggle"
       // or "Allow customers to inactivate". 
       // I'll allow toggle if the requirement says so, but usually customers only cancel.
    }

    setLoading(true);
    try {
      const result = await toggleMyWarrantyStatusAction(warranty.id);
      if (result.status) {
        setStatus(result.data?.status || (status === "active" ? "inactive" : "active"));
        toast.success(result.message || "Status updated");
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const planMonths =
    typeof warranty.planMonths === "number" && warranty.planMonths > 0
      ? warranty.planMonths
      : warranty.warrantyPackage.durationUnit === "years"
      ? warranty.warrantyPackage.durationValue * 12
      : warranty.warrantyPackage.durationValue;

  const dealerName = warranty.dealerName || warranty.dealer?.businessNameTrading || warranty.dealer?.businessNameLegal || "Drive Safe";

  const snapshotPackageName = warranty.packageName || warranty.warrantyPackage.name;
  const snapshotPlanLevel = warranty.planLevel || warranty.warrantyPackage.planLevel;

  const sourceItems = (warranty.benefits && warranty.benefits.length > 0) 
    ? warranty.benefits 
    : (warranty.warrantyPackage.items || []);

  const features = sourceItems
    ?.filter((item: any) => item.type === "feature")
    .map((item: any) => item.label || item.warrantyItem?.label || "") || [];

  const benefits = sourceItems
    ?.filter((item: any) => item.type === "benefit")
    .map((item: any) => item.label || item.warrantyItem?.label || "") || [];

  return (
    <Card
      className={cn(
        "overflow-hidden border-t-4 shadow-sm hover:shadow-md transition-shadow",
        isActive ? "border-t-primary" : "border-t-muted opacity-80"
      )}
    >
      <CardHeader className="bg-muted/5 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={cn("text-xl", isActive ? "text-primary" : "text-muted-foreground")}>
                {snapshotPackageName}
              </CardTitle>
              {planMonths ? (
                <Badge variant="outline" className="text-xs bg-background">
                  {planMonths} Months
                </Badge>
              ) : null}
              {snapshotPlanLevel && (
                <Badge variant="outline" className="text-xs uppercase bg-background">
                  {snapshotPlanLevel}
                </Badge>
              )}
            </div>
            <CardDescription className="font-mono text-xs text-muted-foreground">
              Warranty #: {warranty.policyNumber}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusVariant}>
              {displayStatus}
            </Badge>
            {status === "active" && !isExpired && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                    onClick={handleToggleStatus}
                    disabled={loading}
                >
                    <AlertTriangleIcon className="h-3 w-3 mr-1" />
                    Inactivate
                </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Duration & Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" /> Start Date
            </span>
            <span className="font-medium">{startDate}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" /> End Date
            </span>
            <span className="font-medium">{endDate}</span>
          </div>
        </div>

        <Separator />

        {/* Vehicle Details */}
        {warranty.vehicle && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-muted/30 p-2 rounded border">
              <span className="block text-xs text-muted-foreground mb-1">
                Vehicle
              </span>
              <span className="font-semibold">
                {warranty.vehicle.make} {warranty.vehicle.model}{" "}
                {warranty.vehicle.year}
              </span>
            </div>
            {(warranty.vehicle.registrationNumber ||
              warranty.vehicle.vin) && (
              <div className="bg-muted/30 p-2 rounded border">
                <span className="block text-xs text-muted-foreground mb-1">
                  Registration / VIN
                </span>
                <span className="font-semibold">
                  {warranty.vehicle.registrationNumber
                    ? warranty.vehicle.registrationNumber
                    : warranty.vehicle.vin || ""}
                </span>
              </div>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-medium hover:no-underline hover:cursor-pointer">
              View Full Coverage Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Description */}
                {(warranty.packageDescription || warranty.warrantyPackage.description) && (
                  <div className="text-sm text-muted-foreground">
                    {warranty.packageDescription || warranty.warrantyPackage.description}
                  </div>
                )}

                {/* Features & Benefits */}
                {features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-green-600" />{" "}
                      Included Features
                    </h4>
                    <ul className="grid grid-cols-1 gap-2 text-sm">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2Icon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {benefits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-blue-600" />{" "}
                      Key Benefits
                    </h4>
                    <ul className="grid grid-cols-1 gap-2 text-sm">
                      {benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2Icon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {warranty.dealer && (
            <AccordionItem value="dealer">
              <AccordionTrigger className="text-sm font-medium">
                Dealer Contact Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2 text-sm">
                    <h3 className="text-sm font-semibold truncate">
                      {dealerName}
                    </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MailIcon className="h-4 w-4" />
                    <a href={`mailto:${warranty.dealer.email}`} className="hover:underline">
                      {warranty.dealer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PhoneIcon className="h-4 w-4" />
                    <a href={`tel:${warranty.dealer.phone}`} className="hover:underline">
                      {warranty.dealer.phone}
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
