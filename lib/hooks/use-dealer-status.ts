"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, User } from "@/lib/auth";

export function useDealerStatus() {
  const [isInactive, setIsInactive] = useState(false);
  const [hasHrmAccess, setHasHrmAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        
        if (user && user.role === "dealer") {
          const status = user.details?.status || "active";
          setIsInactive(status !== "active");
          setHasHrmAccess(user.details?.hasHrmAccess || false);
        }
      } catch (error) {
        console.error("Failed to load dealer status:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUser();
    return () => { isMounted = false; };
  }, []);

  return { isInactive, hasHrmAccess, loading };
}
