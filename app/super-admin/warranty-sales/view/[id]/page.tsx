import { notFound } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function WarrantySaleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getWarrantySaleByIdAction(id);
  if (!res.status || !res.data) {
    notFound();
  }
  const sale = res.data;
  const buyerType = sale.customer ? "Customer" : sale.dealer ? "Dealer" : "N/A";
  const buyerName = sale.customer
    ? `${sale.customer.firstName} ${sale.customer.lastName}`
    : sale.dealer
    ? sale.dealer.businessNameTrading || sale.dealer.businessNameLegal
    : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/super-admin/warranty-sales/list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warranty Sale Details</h1>
          <p className="text-muted-foreground mt-2">Comprehensive details of the warranty sale</p>
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
              <span className="text-sm text-muted-foreground">Policy Number</span>
              <span className="font-medium">{sale.policyNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Package</span>
              <span className="font-medium">{sale.warrantyPackage?.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sold To</span>
              <span className="font-medium">{buyerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge>{buyerType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sale Date</span>
              <span className="font-medium">{format(new Date(sale.saleDate), "PPP")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coverage</span>
              <span className="font-medium">
                {format(new Date(sale.coverageStartDate), "PPP")} - {format(new Date(sale.coverageEndDate), "PPP")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(sale.warrantyPrice))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="font-medium">{sale.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={sale.status === "active" ? "default" : "secondary"}>{sale.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
