
import { getWarrantyPackageByIdAction } from "@/lib/actions/warranty-package";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Users, BarChart3, Clock, DollarSign, Activity } from "lucide-react";

export default async function WarrantyPackageViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await getWarrantyPackageByIdAction(id);

  if (!res.status || !res.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-xl text-muted-foreground">Warranty Package not found</p>
        <Button asChild>
          <Link href="/super-admin/warranty-packages/list">Go Back</Link>
        </Button>
      </div>
    );
  }

  const pkg = res.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
             <Link href="/super-admin/warranty-packages/list">
               <ArrowLeft className="h-4 w-4" />
             </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pkg.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{pkg.planLevel || "Standard"}</Badge>
              <Badge variant={pkg.status === "active" ? "default" : "secondary"}>{pkg.status}</Badge>
            </div>
          </div>
        </div>
  
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Dealers & Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created Date</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(pkg.createdAt).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">Since launch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Context</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{pkg.context.replace('_', ' ')}</div>
            <p className="text-xs text-muted-foreground">Package Scope</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle>Package Details</CardTitle>
             <CardDescription>Comprehensive information about this warranty package</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             <div>
               <h3 className="font-semibold mb-2">Description</h3>
               <p className="text-muted-foreground">{pkg.description || "No description provided."}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">12 Months Price</p>
                  <p className="text-xl font-bold">£{pkg.price12Months?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">24 Months Price</p>
                  <p className="text-xl font-bold">£{pkg.price24Months?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">36 Months Price</p>
                  <p className="text-xl font-bold">£{pkg.price36Months?.toLocaleString() || '0'}</p>
                </div>
             </div>

             <div>
               <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
               <p className="text-muted-foreground">{pkg.eligibility || "No specific eligibility criteria."}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 bg-muted/30 rounded-lg">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Mileage Comparator</p>
                 <p className="text-xl font-bold">
                   {pkg.eligibilityMileageComparator === "gt"
                     ? "Greater Than"
                     : pkg.eligibilityMileageComparator === "lt"
                     ? "Less Than"
                     : "—"}
                 </p>
               </div>
               <div className="p-4 bg-muted/30 rounded-lg">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Mileage Value</p>
                 <p className="text-xl font-bold">
                   {typeof pkg.eligibilityMileageValue === "number"
                     ? `${pkg.eligibilityMileageValue.toLocaleString()} km`
                     : "—"}
                 </p>
               </div>
               <div className="p-4 bg-muted/30 rounded-lg">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Vehicle Age (Max Years)</p>
                 <p className="text-xl font-bold">
                   {typeof pkg.eligibilityVehicleAgeYearsMax === "number"
                     ? `${pkg.eligibilityVehicleAgeYearsMax} years`
                     : "—"}
                 </p>
               </div>
               <div className="p-4 bg-muted/30 rounded-lg">
                 <p className="text-sm font-medium text-muted-foreground mb-1">Required Transmission</p>
                 <p className="text-xl font-bold capitalize">
                   {pkg.eligibilityTransmission || "—"}
                 </p>
               </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <h3 className="font-semibold mb-2">Key Benefits</h3>
                 <ul className="space-y-2">
                   {pkg.items
                     ?.filter((item: any) => item.type === "benefit")
                     .map((item: any, i: number) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                         <span className="text-primary">•</span> {item.warrantyItem?.label || item.warrantyItemId}
                       </li>
                     )) || <p className="text-sm text-muted-foreground">No benefits listed.</p>}
                 </ul>
               </div>
             
             </div>
           </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between pb-4 border-b">
               <span className="text-sm font-medium">Excess Amount</span>
               <span className="font-bold">£{pkg.excess?.toLocaleString()}</span>
             </div>
             <div className="flex items-center justify-between pb-4 border-b">
               <span className="text-sm font-medium">Claim Limit</span>
               <span className="font-bold">£{pkg.fixedClaimLimit?.toLocaleString()}</span>
             </div>
             <div className="flex items-center justify-between pb-4 border-b">
               <span className="text-sm font-medium">Labour Rate</span>
               <span className="font-bold">£{pkg.labourRatePerHour?.toLocaleString()}/hr</span>
             </div>
             
             <div className="pt-4">
               <h4 className="text-sm font-medium mb-3">Modification History</h4>
               <div className="space-y-4">
                 <div className="flex gap-3">
                   <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                   <div>
                     <p className="text-sm font-medium">Created</p>
                     <p className="text-xs text-muted-foreground">{new Date(pkg.createdAt).toLocaleString()}</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="h-2 w-2 mt-2 rounded-full bg-gray-300" />
                   <div>
                     <p className="text-sm font-medium">Last Updated</p>
                     <p className="text-xs text-muted-foreground">{new Date(pkg.updatedAt).toLocaleString()}</p>
                   </div>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
