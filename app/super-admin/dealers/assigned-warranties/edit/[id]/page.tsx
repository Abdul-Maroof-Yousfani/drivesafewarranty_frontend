"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  FileText, 
  CheckCircle2, 
  Save, 
  X, 
  Edit3
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEditMode = searchParams.get("mode") === "edit";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  
  // Edit states
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
        // Remove mode=edit from URL without full reload
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
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading assignment details...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block border border-red-200">
          Assignment not found.
        </div>
        <br />
        <Button asChild variant="outline">
          <Link href="/super-admin/dealers/assigned-warranties">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
          </Link>
        </Button>
      </div>
    );
  }

  const pkg = assignment.warrantyPackage || {};
  const benefits = (pkg.items || []).filter((i: any) => i.type === "benefit");
  const features = (pkg.items || []).filter((i: any) => i.type === "feature");

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/super-admin/dealers/assigned-warranties">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                {pkg.name}
              </h1>
              {pkg.planLevel && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                  {pkg.planLevel}
                </Badge>
              )}
              <Badge variant="outline" className="ml-2 uppercase border-emerald-200 text-emerald-700 bg-emerald-50">
                {assignment.status || "Active"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Assigned to <span className="font-semibold text-foreground">{assignment.dealer?.businessNameLegal}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={saving}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" /> Edit Dealer Prices
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pricing & Profitability Card (Main Refinement) */}
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-slate-900/50 border-b">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-700 dark:text-blue-400">Pricing Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure the dealer cost prices for this assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-200 dark:border-blue-800">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-blue-900 dark:text-blue-100">Duration</th>
                      <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Retail Price</th>
                      <th className="px-6 py-4 text-right font-semibold text-blue-700 dark:text-blue-300">Dealer Cost (Edit)</th>
                      <th className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">Dealer Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200/50 dark:divide-blue-800/50 bg-white/40">
                    {[12, 24, 36].map((months) => {
                      const retailPrice = pkg[`price${months}Months`] || 0;
                      const dealerPrice = isEditMode 
                        ? (prices as any)[`dealerPrice${months}Months`] 
                        : (assignment as any)[`dealerPrice${months}Months`] || 0;
                      
                      const profit = retailPrice - (isEditMode ? (prices as any)[`dealerPrice${months}Months`] : dealerPrice);

                      return (
                        <tr key={months} className="hover:bg-blue-100/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-blue-900">{months} Months</td>
                          <td className="px-6 py-4 text-right font-medium">{formatCurrency(retailPrice)}</td>
                          <td className="px-6 py-4 text-right">
                            {isEditMode ? (
                              <div className="flex justify-end">
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                                  <Input 
                                    type="number" 
                                    className="pl-7 pr-3 text-right font-bold h-9 border-blue-300 focus:ring-blue-500"
                                    value={(prices as any)[`dealerPrice${months}Months`]}
                                    onChange={(e) => setPrices({
                                      ...prices,
                                      [`dealerPrice${months}Months`]: parseFloat(e.target.value) || 0
                                    })}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="font-bold text-blue-700">{formatCurrency(dealerPrice)}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">
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

          {/* Features & Benefits (Replicated from Dealer View) */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <CardTitle>Features & Benefits</CardTitle>
              </div>
              <CardDescription>Items included from the master warranty package.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {benefits.length > 0 && (
                <div>
                  <h3 className="font-bold mb-4 flex items-center text-xs uppercase tracking-widest text-slate-500">
                    Key Benefits
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {benefits.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm group p-3 rounded-lg border bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="font-medium text-slate-700">{item.warrantyItem?.label || "Benefit"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {benefits.length > 0 && features.length > 0 && <Separator />}

              {features.length > 0 && (
                <div>
                  <h3 className="font-bold mb-4 flex items-center text-xs uppercase tracking-widest text-slate-500">
                    Included Features
                  </h3>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {features.map((item: any, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="truncate">{item.warrantyItem?.label || "Feature"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Assignment Context */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
               <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Assignment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Assigned At</p>
                  <p className="font-semibold">{new Date(assignment.assignedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Assignment ID</p>
                  <p className="font-mono text-xs text-slate-500 break-all">{assignment.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Limits Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Coverage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Excess</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(pkg.excess)}</span>
                </div>
                <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Labour</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(pkg.labourRatePerHour)}/hr</span>
                </div>
              </div>
              <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Claim Limit</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(pkg.fixedClaimLimit)}</span>
              </div>
              {pkg.eligibility && (
                <div className="flex flex-col p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[10px] text-blue-600/70 uppercase font-bold tracking-widest">Eligibility</span>
                  <span className="text-sm font-medium mt-1 text-slate-700">{pkg.eligibility}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dealer Information */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Dealer Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                 <div className="px-6 py-4">
                   <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Business Name</p>
                   <p className="font-semibold text-slate-800">{assignment.dealer?.businessNameLegal}</p>
                 </div>
                 <div className="px-6 py-4">
                   <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Trading Name</p>
                   <p className="text-slate-700">{assignment.dealer?.businessNameTrading || "-"}</p>
                 </div>
                 <div className="px-6 py-4">
                   <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Contact Email</p>
                   <p className="text-blue-600 hover:underline cursor-pointer">{assignment.dealer?.email}</p>
                 </div>
                 <div className="px-6 py-4">
                   <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Phone Number</p>
                   <p className="text-slate-700">{assignment.dealer?.phone || "-"}</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

