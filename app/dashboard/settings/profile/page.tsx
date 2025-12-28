"use client";

import { useEffect, useState } from "react";
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
            setFirstName(res.data.firstName || user?.firstName || "");
            setLastName(res.data.lastName || user?.lastName || "");
            setPhone(res.data.phone || "");
            setAvatar(res.data.avatar || null);
            setDetails(res.data.details || null);
          } else {
            setFirstName(user?.firstName || "");
            setLastName(user?.lastName || "");
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
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
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setAvatar(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const mod = await import("@/lib/auth");
      const res = await mod.updateMe({
        firstName,
        lastName,
        phone: phone || undefined,
        avatar: avatar ?? null,
      });
      if (res.status) {
        toast.success(res.message || "Profile updated");
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

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : "U";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-muted-foreground">
            Update your name, contact, and logo. Logo appears in the dashboard header.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Basic details used across the application</CardDescription>
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
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dealer Details Section */}
      {user?.role === "dealer" && details && (
        <Card>
          <CardHeader>
            <CardTitle>Dealer Information</CardTitle>
            <CardDescription>Your registered business details (Read-only)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Legal Name</Label>
              <Input value={details.businessNameLegal || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Trading Name</Label>
              <Input value={details.businessNameTrading || ""} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Business Address</Label>
              <Input value={details.businessAddress || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={details.dealerLicenseNumber || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={details.status || ""} disabled />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Section */}
      {user?.role === "customer" && details && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>Your registered vehicle details (Read-only)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle Make</Label>
              <Input value={details.vehicleMake || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Model</Label>
              <Input value={details.vehicleModel || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input value={details.vehicleYear || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Mileage</Label>
              <Input value={details.mileage || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>VIN</Label>
              <Input value={details.vin || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={details.registrationNumber || ""} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input value={details.address || ""} disabled />
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
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
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
                <Button asChild variant="outline" disabled={uploading || loading}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" onClick={handleRemoveLogo} disabled={loading || uploading}>
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

