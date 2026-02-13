"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  getWarrantyAssignmentByIdAction, 
  updateWarrantyAssignmentAction 
} from "@/lib/actions/warranty-sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  Save, 
  X, 
  Edit3,
  Building2,
  Mail,
  Phone,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Suspense } from "react";

function EditAssignmentContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEditMode = searchParams.get("mode") === "edit";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  
  const [prices, setPrices] = useState({
    dealerPrice12Months: 0,
    dealerPrice24Months: 0,
    dealerPrice36Months: 0,
  });

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await getWarrantyAssignmentByIdAction(id);
      if (res.status && res.data) {
        setAssignment(res.data);
        setPrices({
          dealerPrice12Months: res.data.dealerPrice12Months || 0,
          dealerPrice24Months: res.data.dealerPrice24Months || 0,
          dealerPrice36Months: res.data.dealerPrice36Months || 0,
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateWarrantyAssignmentAction(id, prices);
      if (res.status) {
        toast.success("Assignment updated successfully");
        setAssignment({ ...assignment, ...prices });
        setIsEditMode(false);
        router.push(`/super-admin/dealers/assigned-warranties/edit/${id}`, { scroll: false });
      } else {
        toast.error(res.message || "Failed to update assignment");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Assignment not found.</p>
        <Button asChild variant="outline">
          <Link href="/super-admin/dealers/assigned-warranties">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const pkg = assignment.warrantyPackage || {};
  const benefits = (pkg.items || []).filter((i: any) => i.type === "benefit");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/super-admin/dealers/assigned-warranties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{pkg.name}</h1>
              {pkg.planLevel && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">{pkg.planLevel}</Badge>
              )}
              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                {assignment.status || "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Assigned to <span className="font-medium text-foreground">{assignment.dealer?.businessNameLegal}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)} disabled={saving}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditMode(true)}>
              <Edit3 className="h-4 w-4 mr-1" /> Edit Prices
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid - 2 columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Pricing (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Pricing Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Pricing Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-y">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Retail</th>
                    <th className="px-4 py-3 text-right font-medium text-blue-500">Dealer Cost</th>
                    <th className="px-4 py-3 text-right font-medium text-green-500">Dealer's Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[12, 24, 36].map((months) => {
                    const retailPrice = pkg[`price${months}Months`] || 0;
                    const dealerPrice = isEditMode 
                      ? (prices as any)[`dealerPrice${months}Months`] 
                      : (assignment as any)[`dealerPrice${months}Months`] || 0;
                    const profit = retailPrice - dealerPrice;

                    return (
                      <tr key={months} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{months} Months</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(retailPrice)}</td>
                        <td className="px-4 py-3 text-right">
                          {isEditMode ? (
                            <div className="flex justify-end">
                              <div className="relative w-28">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">£</span>
                                <Input 
                                  type="number" 
                                  className="pl-6 pr-2 text-right h-8 text-sm"
                                  value={(prices as any)[`dealerPrice${months}Months`]}
                                  onChange={(e) => setPrices({
                                    ...prices,
                                    [`dealerPrice${months}Months`]: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="font-semibold text-blue-500">{formatCurrency(dealerPrice)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-500">
                          +{formatCurrency(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Benefits */}
          {benefits.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Package Benefits</CardTitle>
                </div>
                <CardDescription>Included coverage items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {benefits.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm text-foreground/80">{item.warrantyItem?.label || "Benefit"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Excess</p>
                  <p className="font-bold">{formatCurrency(pkg.excess)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Wallet className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Labour Rate</p>
                  <p className="font-bold">{formatCurrency(pkg.labourRatePerHour)}/hr</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Claim Limit</p>
                  <p className="font-bold">{formatCurrency(pkg.fixedClaimLimit)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Eligibility Criteria */}
          {(pkg.eligibilityMileageValue || pkg.eligibilityVehicleAgeYearsMax || pkg.eligibilityTransmission || pkg.eligibility) && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {pkg.eligibilityMileageValue && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Max Mileage</span>
                    <span className="font-semibold">
                      {pkg.eligibilityMileageComparator === "less_than" ? "< " : "≤ "}
                      {pkg.eligibilityMileageValue.toLocaleString()} miles
                    </span>
                  </div>
                )}
                {pkg.eligibilityVehicleAgeYearsMax && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Max Vehicle Age</span>
                    <span className="font-semibold">{pkg.eligibilityVehicleAgeYearsMax} years</span>
                  </div>
                )}
                {pkg.eligibilityTransmission && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Transmission</span>
                    <Badge variant="outline" className="capitalize">{pkg.eligibilityTransmission}</Badge>
                  </div>
                )}
                {pkg.eligibility && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-xs">Additional Notes</span>
                    <p className="font-medium text-foreground/80 mt-1">{pkg.eligibility}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment Details */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-lg">Assignment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned</span>
                <span className="font-medium">{new Date(assignment.assignedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={assignment.id}>{assignment.id}</span>
              </div>
            </CardContent>
          </Card>

        
        </div>
      </div>
    </div>
  );
}

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EditAssignmentContent params={params} />
    </Suspense>
  );
}


