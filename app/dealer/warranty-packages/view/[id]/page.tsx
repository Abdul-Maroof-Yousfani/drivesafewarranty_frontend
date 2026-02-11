"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wallet, ShieldCheck, FileText } from "lucide-react";
import { getWarrantyPackageByIdAction } from "@/lib/actions/warranty-package";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";

function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export default function DealerViewWarrantyPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  interface WarrantyPackage {
    id: string;
    name: string;
    description?: string | null;
    planLevel?: string | null;
    eligibility?: string | null;
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    items?: Array<{
      id: string;
      warrantyItemId?: string;
      type: "benefit" | "feature";
      warrantyItem: {
        id: string;
        label: string;
        type: string;
      };
    }> | null;
    durationValue?: number | null;
    durationUnit?: string | null;
    // Customer Price (Selling Price)
    price12Months?: number | null;
    price24Months?: number | null;
    price36Months?: number | null;
    // Dealer Cost (Buying Price)
    dealerPrice12Months?: number | null;
    dealerPrice24Months?: number | null;
    dealerPrice36Months?: number | null;
    status?: string | null;
  }

  const [pkg, setPkg] = useState<WarrantyPackage | null>(null);
  const { id } = React.use(params);

  useEffect(() => {
    (async () => {
      try {
        const result = await getWarrantyPackageByIdAction(id);
        if (result.status && result.data) {
          setPkg(result.data);
        } else {
          setPkg(null);
        }
      } catch (e) {
        console.error("Failed to load package", e);
        setPkg(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <ListSkeleton />;
  }

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center h-60 space-y-4">
        <p className="text-muted-foreground">Package not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Safe access to items
  const items = pkg.items || [];
  const benefits = items.filter((item) => item.type === "benefit");
  const features = items.filter((item) => item.type === "feature");

  return (
    <div className="space-y-6 w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{pkg.name}</h1>
            {pkg.planLevel && (
              <Badge variant="secondary" className="ml-2">
                {pkg.planLevel}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground ml-11">
            {pkg.description || "No description available."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pkg.status === "active" ? (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Link href={`/dealer/warranty-sales/create?packageId=${pkg.id}`}>
                Sell This Package
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <Button disabled size="lg" className="bg-muted text-muted-foreground shadow-none">
                Sell This Package
              </Button>
              <p className="text-[10px] text-destructive font-semibold uppercase tracking-wider">
                Package Inactive
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Financials & Limits */}
        <div className="space-y-6">
          {/* Financial Overview (The requested "Proper Details") */}
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-700 dark:text-blue-400">Pricing & Profitability</CardTitle>
              </div>
              <CardDescription>
                Breakdown of your cost (dealer price), selling price (customer price), and profit margin.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-200 dark:border-blue-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">Duration</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Selling Price</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Your Cost</th>
                      <th className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200/50 dark:divide-blue-800/50">
                    {[12, 24, 36].map((months) => {
                      const priceKey = `price${months}Months` as keyof WarrantyPackage;
                      const costKey = `dealerPrice${months}Months` as keyof WarrantyPackage;
                      const sellingPrice = pkg[priceKey] as number | null;
                      const costPrice = pkg[costKey] as number | null;

                      if (sellingPrice == null && costPrice == null) return null;

                      // Calculate profit: Selling Price - Cost Price (default 0 if null)
                      const profit = (sellingPrice || 0) - (costPrice || 0);

                      return (
                        <tr key={months} className="hover:bg-blue-100/30 dark:hover:bg-blue-900/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{months} Months</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(sellingPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium text-muted-foreground">{formatCurrency(costPrice)}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                            {profit > 0 ? "+" : ""}{formatCurrency(profit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Limits & terms */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gray-500" />
                <CardTitle>Coverage Limits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col p-3 rounded-lg bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Excess</span>
                <span className="text-xl font-bold mt-1 text-primary">{formatCurrency(pkg.excess)}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Labour Rate</span>
                <span className="text-xl font-bold mt-1 text-primary">{formatCurrency(pkg.labourRatePerHour)}/hr</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-muted/40 border sm:col-span-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Fixed Claim Limit</span>
                <span className="text-xl font-bold mt-1 text-primary">{formatCurrency(pkg.fixedClaimLimit)}</span>
                <span className="text-xs text-muted-foreground mt-1">Maximum claim amount per incident</span>
              </div>
              {pkg.eligibility && (
                <div className="flex flex-col p-3 rounded-lg bg-muted/40 border sm:col-span-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Eligibility</span>
                  <span className="text-sm font-medium mt-1">{pkg.eligibility}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Features */}
        <div className="space-y-6">
          <Card className="h-full shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <CardTitle>Features & Benefits</CardTitle>
              </div>
              <CardDescription>What is included in this package.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wide text-primary">Key Benefits</h3>
                  <ul className="space-y-3">
                    {benefits.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm group">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0 group-hover:text-green-600 transition-colors" />
                        <span className="group-hover:text-primary transition-colors">{item.warrantyItem?.label || item.warrantyItemId}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {benefits.length > 0 && features.length > 0 && (
                <Separator className="my-2" />
              )}

              {features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wide text-primary">Included Features</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-muted/40 p-2.5 rounded-md border hover:border-blue-200 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate font-medium text-muted-foreground hover:text-foreground transition-colors" title={item.warrantyItem?.label || item.warrantyItemId}>
                          {item.warrantyItem?.label || item.warrantyItemId}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
