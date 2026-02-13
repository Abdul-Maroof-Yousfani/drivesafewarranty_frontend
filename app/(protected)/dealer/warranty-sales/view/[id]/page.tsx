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

export default async function DealerWarrantySaleViewPage({
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
  
  // Logic for displaying buyer info
  // For a Dealer viewing their own sale:
  // If sale.customer exists, they sold to a Customer.
  // If sale.dealer exists (and it's not them?), it might be a B2B sale? 
  // But usually Dealer Portal is for Dealer -> Customer.
  
  const isSoldToDealer = !!(sale.dealer && !sale.customer); // Heuristic: If Dealer exists but No Customer, it's Sold To Dealer.
  const buyerType = sale.customer ? "Customer" : sale.dealer ? "Dealer" : "N/A";
  const buyerName = sale.customer
    ? `${sale.customer.firstName} ${sale.customer.lastName}`
    : sale.dealer
      ? sale.dealer.businessNameTrading || sale.dealer.businessNameLegal
      : "N/A";

  // IMPORTANT: Sold warranties are immutable snapshots.
  // Use the sale's snapshot fields, NOT the live warrantyPackage data for financial terms.
  const customerPrice12 = sale.price12Months ?? 0;
  const customerPrice24 = sale.price24Months ?? 0;
  const customerPrice36 = sale.price36Months ?? 0;

  const dealerCost12 = sale.dealerCost12Months ?? 0;
  const dealerCost24 = sale.dealerCost24Months ?? 0;
  const dealerCost36 = sale.dealerCost36Months ?? 0;

  const margin12 = Number(customerPrice12) - Number(dealerCost12);
  const margin24 = Number(customerPrice24) - Number(dealerCost24);
  const margin36 = Number(customerPrice36) - Number(dealerCost36);

  // Snapshot fields for package configuration
  const snapshotExcess = sale.excess ?? 0;
  const snapshotLabourRate = sale.labourRatePerHour ?? 0;
  const snapshotClaimLimit = sale.fixedClaimLimit ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/dealer/warranty-sales/list">
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
                {sale.packageName || sale.warrantyPackage?.name || "N/A"}
                {(sale.planLevel || sale.warrantyPackage?.planLevel) && 
                  ` (${sale.planLevel || sale.warrantyPackage.planLevel})`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sold To</span>
              <span className="font-medium">{buyerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant={isSoldToDealer ? "secondary" : "default"}>{buyerType}</Badge>
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
            
            {!isSoldToDealer && (
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
                <span className="text-sm text-muted-foreground">Vehicle Mileage at Sale</span>
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
                {formatCurrency(snapshotExcess)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labour Rate</span>
              <span className="font-medium">
                {formatCurrency(snapshotLabourRate)}/hr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Fixed Claim Limit
              </span>
              <span className="font-medium">
                {formatCurrency(snapshotClaimLimit)}
              </span>
            </div>
            {(sale.packageDescription || sale.warrantyPackage?.description) && (
              <div className="pt-2 border-t mt-2">
                <span className="text-sm text-muted-foreground block mb-1">Description</span>
                <p className="text-sm">{sale.packageDescription || sale.warrantyPackage.description}</p>
              </div>
            )}
            {(sale.packageEligibility || sale.warrantyPackage?.eligibility) && (
              <div className="pt-2 border-t mt-2">
                <span className="text-sm text-muted-foreground block mb-1">Eligibility</span>
                <p className="text-sm bg-muted/50 p-2 rounded">{sale.packageEligibility || sale.warrantyPackage.eligibility}</p>
              </div>
            )}
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

      {/* Pricing Details Card - ALWAYS SHOW DEALER BREAKDOWN for Dealers */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pricing Breakdown
          </CardTitle>
          <CardDescription>
            Shows customer prices, your costs, and profit margins for each duration
          </CardDescription>
        </CardHeader>
        <CardContent>
            {/* Dealer pricing table with customer price, dealer cost, and margin */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Customer Price</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Your Cost</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Your Margin</th>
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
        </CardContent>
      </Card>
    </div>
  );
}
