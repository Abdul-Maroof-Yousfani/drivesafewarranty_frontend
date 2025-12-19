"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PasswordResetPrompt() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Check if user needs to change password
    const mustChangePassword = Cookies.get("mustChangePassword");
    if (mustChangePassword === "true") {
      setShowAlert(true);
      // Show toast notification as well
      toast.info("This is your first login. Please change your password in your profile settings.", {
        duration: 5000,
      });
    }
  }, []);

  // Don't render if alert shouldn't show
  if (!showAlert) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-top-5">
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900 shadow-lg">
        <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold mb-1">First Login Detected</p>
              <p className="text-sm">
                This is your first login. Please change your password in your profile settings for security.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlert(false)}
              className="text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 h-auto p-1"
            >
              ×
            </Button>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/settings/password">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Change Password
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

