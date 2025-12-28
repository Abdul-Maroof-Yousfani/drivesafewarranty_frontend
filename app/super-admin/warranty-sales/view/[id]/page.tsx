import { notFound } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Helper function to format currency
function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}

export default async function WarrantySaleViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getWarrantySaleByIdAction(id);
  if (!res.status || !res.data) {
    notFound();
  }
  const sale = res.data;
  const isDealer = !!sale.dealer;
  const buyerType = sale.customer ? "Customer" : sale.dealer ? "Dealer" : "N/A";
  const buyerName = sale.customer
    ? `${sale.customer.firstName} ${sale.customer.lastName}`
    : sale.dealer
      ? sale.dealer.businessNameTrading || sale.dealer.businessNameLegal
      : "N/A";

  // Calculate dealer costs and margins
  const customerPrice12 = sale.price12Months ?? sale.warrantyPackage?.price12Months ?? 0;
  const customerPrice24 = sale.price24Months ?? sale.warrantyPackage?.price24Months ?? 0;
  const customerPrice36 = sale.price36Months ?? sale.warrantyPackage?.price36Months ?? 0;

  const dealerCost12 = sale.dealerCost12Months ?? sale.warrantyPackage?.dealerPrice12Months ?? 0;
  const dealerCost24 = sale.dealerCost24Months ?? sale.warrantyPackage?.dealerPrice24Months ?? 0;
  const dealerCost36 = sale.dealerCost36Months ?? sale.warrantyPackage?.dealerPrice36Months ?? 0;

  const margin12 = Number(customerPrice12) - Number(dealerCost12);
  const margin24 = Number(customerPrice24) - Number(dealerCost24);
  const margin36 = Number(customerPrice36) - Number(dealerCost36);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/super-admin/warranty-sales/list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Warranty Sale Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive details of the warranty sale
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Key information of the sale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Warranty Number
              </span>
              <span className="font-medium">{sale.policyNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Package</span>
              <span className="font-medium">
                {sale.warrantyPackage?.name || "N/A"}
                {sale.warrantyPackage?.planLevel && ` (${sale.warrantyPackage.planLevel})`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sold To</span>
              <span className="font-medium">{buyerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant={isDealer ? "secondary" : "default"}>{buyerType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sale Date</span>
              <span className="font-medium">
                {format(new Date(sale.saleDate), "PPP")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coverage</span>
              <span className="font-medium">
                {format(new Date(sale.coverageStartDate), "PPP")} -{" "}
                {format(new Date(sale.coverageEndDate), "PPP")}
              </span>
            </div>
            {/* Only show price in summary for customers, not for dealers */}
            {!isDealer && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">
                  {formatCurrency(sale.warrantyPrice)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Payment Method
              </span>
              <span className="font-medium">{sale.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={sale.status === "active" ? "default" : "secondary"}
              >
                {sale.status}
              </Badge>
            </div>
            {sale.mileageAtSale && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mileage at Sale</span>
                <span className="font-medium">{sale.mileageAtSale.toLocaleString()} miles</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Customer Consent</span>
              <span className={`font-medium ${sale.customerConsent ? 'text-green-600' : 'text-red-600'}`}>
                {sale.customerConsent ? "Agreed" : "Not Agreed"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Configuration</CardTitle>
            <CardDescription>
              Package settings for this assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Excess</span>
              <span className="font-medium">
                {formatCurrency(sale.excess ?? sale.warrantyPackage?.excess ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labour Rate</span>
              <span className="font-medium">
                {formatCurrency(sale.labourRatePerHour ?? sale.warrantyPackage?.labourRatePerHour ?? 0)}/hr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Fixed Claim Limit
              </span>
              <span className="font-medium">
                {formatCurrency(sale.fixedClaimLimit ?? sale.warrantyPackage?.fixedClaimLimit ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {sale.vehicle && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>The vehicle covered by this warranty</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-semibold">{sale.vehicle.make} {sale.vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-semibold">{sale.vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-semibold">{sale.vehicle.registrationNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-semibold uppercase truncate" title={sale.vehicle.vin || ""}>{sale.vehicle.vin || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pricing Details Card - Different view for dealer vs customer */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isDealer ? "Dealer Pricing Breakdown" : "Customer Pricing"}
          </CardTitle>
          <CardDescription>
            {isDealer
              ? "Shows customer prices, dealer costs, and margins for each duration"
              : "Fixed customer prices for each warranty duration"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDealer ? (
            // Dealer pricing table with customer price, dealer cost, and margin
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Customer Price</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Dealer Cost (SA Price)</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Dealer Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">12 Months</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(customerPrice12)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(dealerCost12)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${margin12 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margin12)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">24 Months</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(customerPrice24)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(dealerCost24)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${margin24 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margin24)}
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">36 Months</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(customerPrice36)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(dealerCost36)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${margin36 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margin36)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            // Customer pricing - simple list
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">12-Month Price</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(customerPrice12)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">24-Month Price</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(customerPrice24)}</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">36-Month Price</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(customerPrice36)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
