import { notFound } from "next/navigation";
import { getWarrantySaleByIdAction } from "@/lib/actions/warranty-sales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WarrantySaleEditForm } from "./edit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}

export default async function WarrantySaleEditPage({
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
            Edit Warranty Sale
          </h1>
          <p className="text-muted-foreground mt-2">Update sale details</p>
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
                {sale.warrantyPackage?.planLevel &&
                  ` (${sale.warrantyPackage.planLevel})`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sold To</span>
              <span className="font-medium">{buyerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium">{buyerType}</span>
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
              <span className="font-medium">{sale.paymentMethod || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-medium">{sale.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Modify fields and save changes</CardDescription>
          </CardHeader>
          <CardContent>
            <WarrantySaleEditForm sale={sale} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
