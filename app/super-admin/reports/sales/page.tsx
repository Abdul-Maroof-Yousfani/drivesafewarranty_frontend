"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-muted-foreground mt-2">
          View comprehensive sales analytics and reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
          <CardDescription>Overall warranty sales statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sales report content will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}

