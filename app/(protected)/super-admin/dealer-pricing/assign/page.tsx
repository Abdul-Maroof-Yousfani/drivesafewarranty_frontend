"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignDealerPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assign Dealer Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Set custom pricing for warranty packages per dealer
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dealer Pricing Assignment</CardTitle>
          <CardDescription>Assign custom pricing to dealers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Pricing assignment form will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}

