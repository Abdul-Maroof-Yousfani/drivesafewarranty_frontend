"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { getWarrantyPackageByIdAction } from "@/lib/actions/warranty-package";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    planLevel?: string | null;
    durationValue?: number | null;
    durationUnit?: "months" | "years" | string | null;
    price12Months?: number | null;
    price24Months?: number | null;
    price36Months?: number | null;
    description?: string | null;
    eligibility?: string | null;
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    includedFeatures?: string[] | null;
    keyBenefits?: string[] | null;
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
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Package not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const durationLabel =
    pkg.durationValue && pkg.durationUnit
      ? `${pkg.durationValue} ${
          pkg.durationUnit === "years" ? "Year" : "Month"
        }${pkg.durationValue > 1 ? "s" : ""}`
      : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Package Details</h1>
          <p className="text-muted-foreground mt-2">
            View package information before assigning it to your customers.
          </p>
        </div>
        <Button asChild>
          <Link href={`/dealer/warranty-sales/create?packageId=${pkg.id}`}>
            Assign to Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pkg.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pkg.price12Months != null && (
            <p>
              <span className="font-medium">12 Months Price:</span> $
              {pkg.price12Months}
            </p>
          )}
          {pkg.price24Months != null && (
            <p>
              <span className="font-medium">24 Months Price:</span> $
              {pkg.price24Months}
            </p>
          )}
          {pkg.price36Months != null && (
            <p>
              <span className="font-medium">36 Months Price:</span> $
              {pkg.price36Months}
            </p>
          )}
          {pkg.description && (
            <p>
              <span className="font-medium">Description:</span>{" "}
              {pkg.description}
            </p>
          )}
          {pkg.eligibility && (
            <p>
              <span className="font-medium">Eligibility:</span>{" "}
              {pkg.eligibility}
            </p>
          )}
          {pkg.excess != null && (
            <p>
              <span className="font-medium">Excess:</span> £{pkg.excess}
            </p>
          )}
          {pkg.labourRatePerHour != null && (
            <p>
              <span className="font-medium">Labour Rate:</span> £
              {pkg.labourRatePerHour} per hour
            </p>
          )}
          {pkg.fixedClaimLimit != null && (
            <p>
              <span className="font-medium">Fixed Claim Limit:</span> £
              {pkg.fixedClaimLimit}
            </p>
          )}
          {Array.isArray(pkg.includedFeatures) &&
            pkg.includedFeatures.length > 0 && (
              <div>
                <p className="font-medium mb-1">Included Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  {pkg.includedFeatures.map((f: string, idx: number) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          {Array.isArray(pkg.keyBenefits) && pkg.keyBenefits.length > 0 && (
            <div>
              <p className="font-medium mb-1">Key Benefits:</p>
              <ul className="list-disc list-inside space-y-1">
                {pkg.keyBenefits.map((f: string, idx: number) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
