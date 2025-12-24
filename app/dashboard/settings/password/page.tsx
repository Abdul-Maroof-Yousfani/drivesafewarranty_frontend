"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmitReal = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("currentPassword", currentPassword);
      formData.set("newPassword", newPassword);
      const mod = await import("@/lib/auth");
      const result = await mod.changePassword(formData);
      if (result.status) {
        toast.success(result.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Change Password</h2>
          <p className="text-muted-foreground">
            Choose a strong password to keep your account secure.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Enter your current and new password</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="flex items-center justify-end">
            <Button onClick={handleSubmitReal} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
