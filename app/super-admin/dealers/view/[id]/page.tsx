
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  KeyRound,
  Clipboard,
  ShieldCheck,
  CreditCard,
  FileBadge,
  BadgeCheck,
  Package,
  Package2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getDealerById,
  type Dealer,
  type DealerLoginCredentials,
  verifyDealerCredentials,
} from "@/lib/actions/dealer";
import { toast } from "sonner";

export default function DealerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [verifyingCredentials, setVerifyingCredentials] = useState(false);
  const [credentials, setCredentials] = useState<DealerLoginCredentials | null>(
    null
  );
  const [credentialsHideAt, setCredentialsHideAt] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchDealer = async () => {
      if (!params.id) return;

      try {
        const result = await getDealerById(params.id as string);
        if (result.status && result.data) {
          setDealer(result.data);
        } else {
          toast.error(result.message || "Failed to fetch dealer details");
        }
      } catch (error) {
        console.error("Error fetching dealer:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchDealer();
  }, [params.id]);

  useEffect(() => {
    if (!credentialsHideAt) return;
    const remainingMs = credentialsHideAt - Date.now();
    if (remainingMs <= 0) {
      setCredentials(null);
      setCredentialsHideAt(null);
      setAdminPassword("");
      setCredentialsOpen(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCredentials(null);
      setCredentialsHideAt(null);
      setAdminPassword("");
      setCredentialsOpen(false);
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [credentialsHideAt]);

  const credentialsVisible = useMemo(() => {
    if (!credentials || !credentialsHideAt) return false;
    return Date.now() < credentialsHideAt;
  }, [credentials, credentialsHideAt]);

  const handleVerifyCredentials = async () => {
    const dealerId = params.id as string | undefined;
    if (!dealerId) return;

    if (!adminPassword.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setVerifyingCredentials(true);
    try {
      const result = await verifyDealerCredentials(dealerId, adminPassword);
      if (result.status && result.data) {
        setCredentials(result.data);
        setAdminPassword("");
        setCredentialsHideAt(Date.now() + 8000);
        setCredentialsOpen(false);
        toast.success("Credentials revealed briefly");
      } else {
        toast.error(result.message || "Invalid password");
      }
    } catch (error) {
      console.error("Error verifying credentials:", error);
      toast.error("Failed to verify password");
    } finally {
      setVerifyingCredentials(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!credentialsVisible || !credentials) return;

    const text = `Login URL: ${credentials.loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
        return;
      }
    } catch {}

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) toast.success("Copied to clipboard");
      else toast.error("Copy failed");
    } catch {
      toast.error("Copy failed");
    }
  };

  const formatBytes = (bytes: number | string) => {
    const value = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (!value || isNaN(value) || value === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!dealer?.dealerStorage) return 0;
    const used = parseInt(dealer.dealerStorage.usedBytes);
    const limit = parseInt(dealer.dealerStorage.limitBytes);
    if (!limit) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-xl text-muted-foreground">Dealer not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-7 w-7">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {dealer.businessNameLegal}
              </h1>
              {dealer.dealerAgreementSigned && (
                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0">
              <span className={cn(
                "px-1.5 py-0 text-[9px] font-bold rounded-full uppercase tracking-tight",
                dealer.status === "active" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              )}>
                {dealer.status}
              </span>
              <p className="text-[10px] text-muted-foreground font-mono">
                #{dealer.id}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 text-[10px] font-bold bg-violet-50/50 dark:bg-violet-900/20 text-white-600 border-violet-100 hover:bg-violet-100"
            onClick={() => {
              setCredentialsOpen(true);
              setAdminPassword("");
            }}
          >
            <KeyRound className="mr-1 h-3 w-3" />
            Reveal Login Credentials
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs shadow-sm">
            <Link href={`/super-admin/dealers/edit/${params.id}`}>
              <Edit className="mr-1.5 h-3 w-3" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Credentials Reveal Banner */}
      {credentialsVisible && credentials && (
        <div className="bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-lg p-3 flex flex-wrap gap-x-8 gap-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase text-violet-600 tracking-wider">Login URL</p>
            <p className="text-xs font-mono">{credentials.loginUrl}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase text-violet-600 tracking-wider">Admin Email</p>
            <p className="text-xs font-mono">{credentials.email}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase text-violet-600 tracking-wider">Password</p>
            <p className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400">{credentials.password}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Customers", value: dealer.totalCustomers || 0, icon: User, color: "primary" },
          { label: "Warranties", value: dealer.totalWarranties || 0, icon: BadgeCheck, color: "blue" },
          { label: "Revenue", value: `£${(dealer.amountPaid || 0).toLocaleString()}`, icon: CreditCard, color: "emerald" },
          { label: "Storage", value: `${getStoragePercentage()}%`, icon: FileBadge, color: "amber" },
        ].map((stat, idx) => (
          <Card key={idx} className="shadow-none border-muted bg-card/50">
            <CardContent className="p-3 flex flex-col gap-0.5">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">{stat.value}</span>
                <stat.icon className={cn("h-3.5 w-3.5 opacity-40", `text-${stat.color}-500`)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={credentialsOpen}
        onOpenChange={(open) => {
          setCredentialsOpen(open);
          if (!open) {
            setCredentials(null);
            setCredentialsHideAt(null);
            setAdminPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Admin Verification</DialogTitle>
            <DialogDescription>
              Enter password to reveal credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              onClick={handleVerifyCredentials}
              disabled={verifyingCredentials}
              className="w-full"
            >
              {verifyingCredentials ? "Verifying..." : "Reveal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Content Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-none border-muted group overflow-hidden">
            <CardHeader className=" bg-muted/20 border-b-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-sm font-bold">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-2 border-b md:border-r border-muted/50 space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Legal Name</label>
                    <p className="font-semibold text-xs">{dealer.businessNameLegal || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Trading Name</label>
                    <p className="text-xs">{dealer.businessNameTrading || dealer.businessNameLegal}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Business Address</label>
                    <p className="text-xs leading-relaxed text-muted-foreground">{dealer.businessAddress || "N/A"}</p>
                  </div>
                </div>

                <div className="p-2 border-b border-muted/50 space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Contact Person</label>
                    <p className="font-semibold text-xs">{dealer.contactPersonName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <p className="text-xs">{dealer.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Contact Number</label>
                    <p className="text-xs">{dealer.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3 md:col-span-2 bg-muted/5 flex flex-wrap gap-x-8 gap-y-2">
                   <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">License Number</label>
                      <p className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border inline-block">{dealer.dealerLicenseNumber || "N/A"}</p>
                   </div>
                   <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Registration Number</label>
                      <p className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border inline-block">{dealer.businessRegistrationNumber || "N/A"}</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Packages section */}
          <Card className="shadow-none border-muted">
            <CardHeader className="bg-muted/20 border-b-1">
            <div className="flex items-center gap-2">
                <Package2 className="h-3.5 w-3.5 text-primary" />
               <CardTitle className="text-[12px] font-black uppercase tracking-widest opacity-100">Warranty Packages</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="p-0">
              {Array.isArray(dealer.warrantyPackages) && dealer.warrantyPackages.length > 0 ? (
                dealer.warrantyPackages.slice(0, 5).map((pkg: any) => (
                  <div key={pkg.id} className="p-3 border-b border-muted/50 last:border-0 hover:bg-muted/30 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{pkg.name}</span>
                      {pkg.planLevel && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 font-bold uppercase border-primary/30 text-primary bg-primary/5">
                          {pkg.planLevel}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Duration</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 text-right">Dealer Price</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 text-right">Customer Price</span>
                      
                      {pkg.price12Months || pkg.dealerPrice12Months ? (
                        <>
                          <span className="text-[11px] text-muted-foreground">12 Months</span>
                          <span className="text-[11px] font-mono text-right text-muted-foreground/80">£{pkg.dealerPrice12Months || 0}</span>
                          <span className="text-[11px] font-mono text-primary font-bold text-right">£{pkg.price12Months || 0}</span>
                        </>
                      ) : null}

                      {pkg.price24Months || pkg.dealerPrice24Months ? (
                        <>
                          <span className="text-[11px] text-muted-foreground">24 Months</span>
                          <span className="text-[11px] font-mono text-right text-muted-foreground/80">£{pkg.dealerPrice24Months || 0}</span>
                          <span className="text-[11px] font-mono text-primary font-bold text-right">£{pkg.price24Months || 0}</span>
                        </>
                      ) : null}

                      {pkg.price36Months || pkg.dealerPrice36Months ? (
                        <>
                          <span className="text-[11px] text-muted-foreground">36 Months</span>
                          <span className="text-[11px] font-mono text-right text-muted-foreground/80">£{pkg.dealerPrice36Months || 0}</span>
                          <span className="text-[11px] font-mono text-primary font-bold text-right">£{pkg.price36Months || 0}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-[10px] italic text-muted-foreground px-2">No active packages assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-4">
          <Card className="shadow-none border-muted overflow-hidden">
            <CardHeader className=" bg-muted/20 border-b-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                <CardTitle className="text-sm font-bold">Bank Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
               <div className="space-y-3">
                 <div>
                   <label className="text-[9px] font-bold text-muted-foreground uppercase">Bank Name</label>
                   <p className="text-xs font-medium">{dealer.bankDetails?.bankName || "N/A"}</p>
                 </div>
                 <div>
                   <label className="text-[9px] font-bold text-muted-foreground uppercase">Account Holder</label>
                   <p className="text-xs font-medium">{dealer.bankDetails?.accountHolderName || "N/A"}</p>
                 </div>
                 <div>
                   <label className="text-[9px] font-bold text-muted-foreground uppercase">Account Number</label>
                   <p className="text-xs font-mono tracking-tighter">{dealer.bankDetails?.accountNumber || "N/A"}</p>
                 </div>
                 <div>
                   <label className="text-[9px] font-bold text-muted-foreground uppercase">Routing / Sort Code</label>
                   <p className="text-xs font-mono">{dealer.bankDetails?.routingNumber || "N/A"}</p>
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-muted overflow-hidden">
            <CardHeader className="bg-muted/20 border-b-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                  <CardTitle className="text-sm font-bold text-orange-900 dark:text-orange-100">Authorized Signatory</CardTitle>
                </div>
                {dealer.dealerAgreementSigned ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase">Signed</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-black uppercase opacity-50 text-muted-foreground">Pending</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className=" space-y-3">
               <div>
                  <p className="font-bold text-xs">{dealer.authorizedSignatory?.name || "N/A"}</p>
                  <p className="text-[12px] text-muted-foreground">{dealer.authorizedSignatory?.title || "Legal representative"}</p>
               </div>
               <div className="space-y-1 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-[12px] truncate">
                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span> <span className="font-bold">Email:</span> {dealer.authorizedSignatory?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span><span className="font-bold">Phone:</span> {dealer.authorizedSignatory?.phone || "N/A"}</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
