"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, User } from "@/lib/auth";

export function useDealerStatus() {
  const [isInactive, setIsInactive] = useState(false);
  const [hasHrmAccess, setHasHrmAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user && user.role === "dealer") {
        const status = user.details?.status || "active";
        setIsInactive(status !== "active");
        setHasHrmAccess(user.details?.hasHrmAccess || false);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  return { isInactive, hasHrmAccess, loading };
}
