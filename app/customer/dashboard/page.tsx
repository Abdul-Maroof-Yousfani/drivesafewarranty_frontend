"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Calendar, FileText, Car, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  // TODO: Fetch customer-specific warranty data
  const warranty = {
    package: "Gold 2 Year",
    startDate: new Date().toLocaleDateString(),
    endDate: new Date().toLocaleDateString(),
    status: "Active",
    vehicle: "Toyota Camry 2023",
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            My Warranty Coverage
          </h1>
          <p className="text-muted-foreground mt-2">
            View your warranty details, vehicle information, and coverage status
          </p>
        </div>
      </div>

      {/* Warranty Status Card */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warranty Status</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <span>{warranty.status}</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {warranty.package}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Warranty Details Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Warranty Information
            </CardTitle>
            <CardDescription>Your warranty package and coverage details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Package Type</p>
                <p className="text-sm font-bold">{warranty.package}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Coverage Start</p>
                <p className="text-sm">{warranty.startDate}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Coverage End</p>
                <p className="text-sm font-medium">{warranty.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Vehicle Information
            </CardTitle>
            <CardDescription>Your covered vehicle details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{warranty.vehicle}</p>
                  <p className="text-xs text-muted-foreground">Protected Vehicle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your warranty documents and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
              <Link href="/customer/documents">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">View Documents</p>
                    <p className="text-xs text-muted-foreground">Warranty papers & certificates</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
              <Link href="/customer/enquiries">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Submit Enquiry</p>
                    <p className="text-xs text-muted-foreground">Request service or support</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

