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
} from "lucide-react";
import Link from "next/link";
import {
  getDealerById,
  type DealerLoginCredentials,
  verifyDealerCredentials,
} from "@/lib/actions/dealer";
import { toast } from "sonner";

export default function DealerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [dealer, setDealer] = useState<any>(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dealer Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View dealer information and statistics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/super-admin/dealers/edit/${params.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Dealer
            </Link>
          </Button>
        </div>
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Dealer Login Credentials</DialogTitle>
            <DialogDescription>
              Enter your password to reveal credentials briefly.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="adminPassword">Your Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleVerifyCredentials}
                disabled={verifyingCredentials}
              >
                {verifyingCredentials ? "Verifying..." : "Verify & Reveal"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Dealer contact and business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Dealer Name</p>
                <p className="text-sm text-muted-foreground">
                  {dealer.businessNameLegal || "N/A"}
                </p>
                {dealer.businessNameTrading &&
                  dealer.businessNameTrading !== dealer.businessNameLegal && (
                    <p className="text-xs text-muted-foreground">
                      (Trading as: {dealer.businessNameTrading})
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {dealer.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {dealer.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">
                  {dealer.contactPersonName || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {dealer.businessAddress || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Dealer performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{dealer.totalCustomers || 0}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Warranties Sold</p>
              <p className="text-2xl font-bold">
                {dealer.totalWarranties || 0}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Amount Paid</p>
              <p className="text-2xl font-bold">
                {typeof dealer.amountPaid === "number"
                  ? `£${dealer.amountPaid.toFixed(2)}`
                  : "£0.00"}
              </p>
            </div>
            {/* <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Amount Received</p>
              <p className="text-2xl font-bold">
                {typeof dealer.amountReceived === "number"
                  ? `£${dealer.amountReceived.toFixed(2)}`
                  : "£0.00"}
              </p>
            </div> */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Status</p>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  dealer.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {dealer.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Warranty Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.isArray(dealer.warrantyPackages) &&
            dealer.warrantyPackages.length > 0 ? (
              dealer.warrantyPackages.map((pkg: any) => (
                <div key={pkg.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{pkg.name}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        12 Months Price:{" "}
                      </span>{" "}
                      {pkg.price12Months != null
                        ? `£${Number(pkg.price12Months).toFixed(2)}`
                        : "—"}
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        24 Months Price:
                      </span>{" "}
                      {pkg.price24Months != null
                        ? `£${Number(pkg.price24Months).toFixed(2)}`
                        : "—"}
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        36 Months Price:
                      </span>{" "}
                      {pkg.price36Months != null
                        ? `£${Number(pkg.price36Months).toFixed(2)}`
                        : "—"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No SA-assigned packages found for this dealer.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dealer Credentials</CardTitle>
            <CardDescription>
              Reveal briefly after verifying your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-md border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Login URL</p>
                <p className="text-sm text-muted-foreground break-all">
                  {credentialsVisible && credentials
                    ? credentials.loginUrl
                    : "••••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground break-all">
                  {credentialsVisible && credentials
                    ? credentials.email
                    : "••••••••••••••••••••••••••••••"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-muted-foreground break-all">
                  {credentialsVisible && credentials
                    ? credentials.password
                    : "••••••••••••••••••••••••••••••"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCredentialsOpen(true);
                  setAdminPassword("");
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Show
              </Button>
              <Button
                onClick={handleCopyCredentials}
                disabled={!credentialsVisible || !credentials}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
