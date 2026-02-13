"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@/lib/auth");
        const res = await mod.getMe();
        if (!cancelled) {
          if (res.status && res.data) {
            setFirstName(
              sanitizeStr(res.data.firstName) ||
                sanitizeStr(user?.firstName) ||
                ""
            );
            setLastName(
              sanitizeStr(res.data.lastName) ||
                sanitizeStr(user?.lastName) ||
                ""
            );
            setPhone(sanitizeStr(res.data.phone) || "");
            setAvatar(res.data.avatar || null);
            setDetails(res.data.details || null);
          } else {
            setFirstName(sanitizeStr(user?.firstName) || "");
            setLastName(sanitizeStr(user?.lastName) || "");
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Profile load failed");
        setFirstName(user?.firstName || "");
        setLastName(user?.lastName || "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    // Check file size (2MB limit)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds 2MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = "";
      return;
    }
    
    setUploading(true);
    try {
      const mod = await import("@/lib/auth");
      const result = await mod.uploadLogo(file);
      if (result.status && result.url) {
        setAvatar(result.url);
        toast.success("Logo uploaded");
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      // Check if it's a size limit error from server
      if (error?.message?.includes("Body exceeded") || error?.statusCode === 413) {
        toast.error("File size exceeds server limit. Please choose a smaller file.");
      } else {
        toast.error(error?.message || "Failed to upload logo");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setAvatar(null);
  };

  const handleSave = async () => {
    // Validation
    const phoneRegex = /^(?:\+?\d{1,3})?[\d\s\-]{7,15}$/;

    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error("Invalid phone number (e.g., 07123456789 or +447123456789)");
      return;
    }

    if (user?.role === "customer" && details?.address) {
       // Removed postcode validation
    }

    setSaving(true);
    try {
      const mod = await import("@/lib/auth");
      const res = await mod.updateMe({
        firstName,
        lastName,
        phone: phone || undefined,
        avatar: avatar ?? null,
        ...details,
      });
      if (res.status) {
        toast.success(res.message || "Profile updated");
        // Force page reload to refresh all components with updated user data
        setTimeout(() => {
          window.location.reload();
        }, 500); // Small delay to show toast message first
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const sanitizeStr = (s: any) => (s === "undefined" || !s ? "" : s);

  const initials = (
    (sanitizeStr(firstName)[0] || user?.firstName?.[0] || "U") +
    (sanitizeStr(lastName)[0] || user?.lastName?.[0] || "")
  ).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-muted-foreground">
            Update your name, contact, and logo. Logo appears in the dashboard
            header.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Basic details used across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
              placeholder="e.g. 07123456789"
              maxLength={13}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dealer Details Section - Read Only as requested */}
      {user?.role === "dealer" && (
        <Card>
          <CardHeader>
            <CardTitle>Dealer Information</CardTitle>
            <CardDescription>Your business details (Read-only)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessNameLegal">Business Legal Name</Label>
              <Input
                id="businessNameLegal"
                value={details?.businessNameLegal || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessNameTrading">Trading Name</Label>
              <Input
                id="businessNameTrading"
                value={details?.businessNameTrading || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                value={details?.businessAddress || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber">
                Registration Number
              </Label>
              <Input
                id="businessRegistrationNumber"
                value={details?.businessRegistrationNumber || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                value={details?.dealerLicenseNumber || ""}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Bank Details Breakdown */}
            <div className="md:col-span-2 pt-2 border-t">
              <h3 className="text-sm font-semibold mb-3">Bank Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={details?.bankDetails?.bankName || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number/IBAN </Label>
                  <Input
                    value={details?.bankDetails?.accountNumber || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Holder</Label>
                  <Input
                    value={details?.bankDetails?.accountHolderName || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input
                    value={details?.bankDetails?.routingNumber || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Authorized Signatory Breakdown */}
            <div className="md:col-span-2 pt-2 border-t">
              <h3 className="text-sm font-semibold mb-3">
                Authorized Signatory
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Signatory Name</Label>
                  <Input
                    value={details?.authorizedSignatory?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title/Designation</Label>
                  <Input
                    value={details?.authorizedSignatory?.title || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={details?.authorizedSignatory?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={details?.authorizedSignatory?.phone || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={details?.status || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Section - Now Editable, No Vehicles */}
      {user?.role === "customer" && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your contact and address details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={details?.address || ""}
                onChange={(e) =>
                  setDetails({ ...details, address: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={details?.status || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Used for theming and header display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatar ? (
                <AvatarImage src={avatar} alt="Logo" />
              ) : (
                <AvatarFallback className="text-base">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  asChild
                  variant="outline"
                  disabled={uploading || loading}
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </span>
                </Button>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={loading || uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
