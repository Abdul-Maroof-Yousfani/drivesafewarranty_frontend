"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewDealerPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">View Dealer Pricing</h1>
        <p className="text-muted-foreground mt-2">
          View pricing assigned to dealers
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Dealer pricing list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}

