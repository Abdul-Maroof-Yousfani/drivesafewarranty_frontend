"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CHECK_INTERVAL = 1 * 60 * 1000; // Check every 1 minutes

export function SessionChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionExpired, setSessionExpired] = useState(false);

  const performCheck = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check-session");

      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!res.ok) {
        if (res.status >= 500) {
          console.error(`[SessionChecker] API returned status: ${res.status}`);
        }
        return;
      }

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!data.valid) {
          console.log("[SessionChecker] Session invalid:", data.reason);
          setSessionExpired(true);
        } else {
          // Session is valid, reset expired state
          setSessionExpired(false);
        }
      } catch (jsonErr) {
        console.error("[SessionChecker] Failed to parse JSON:", jsonErr);
        console.error("[SessionChecker] Response text was:", text);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  }, []);

  useEffect(() => {
    // Don't check if we're on login page
    if (pathname === "/login") {
      setSessionExpired(false);
      return;
    }

    // Initial check
    performCheck();

    // Set up interval
    const interval = setInterval(performCheck, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [performCheck, pathname]);

  const handleLogin = () => {
    // Close the dialog first
    setSessionExpired(false);

    // Get the current pathname or default to dashboard
    const currentPath = pathname || "/dashboard";
    const callbackUrl = encodeURIComponent(currentPath);

    // Redirect to login page
    router.push(`/login?callbackUrl=${callbackUrl}`);
  };

  return (
    <AlertDialog open={sessionExpired}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogin}>
            Go to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
