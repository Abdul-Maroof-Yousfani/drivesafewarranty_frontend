"use server";

import { cookies } from "next/headers";
import { API_BASE } from "./constants";

export interface StorageUsage {
  usedBytes: string;
  limitBytes: string;
  availableBytes: string;
  usedMB: number;
  usedGB: number;
  limitGB: number;
  percentageUsed: number;
  availableGB: number;
}

export async function getStorageUsageAction(): Promise<{
  status: boolean;
  data?: StorageUsage;
  message?: string;
}> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      console.error("[Storage] No access token found");
      return { status: false, message: "Unauthorized" };
    }

    console.log("[Storage] Fetching from:", `${API_BASE}/upload/storage/usage`);
    const response = await fetch(`${API_BASE}/upload/storage/usage`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const result = await response.json();
    console.log("[Storage] Response status:", response.status);
    console.log("[Storage] Response data:", result);

    if (!response.ok) {
      console.error("[Storage] Error response:", result);
      return {
        status: false,
        message: result.message || "Failed to fetch storage usage",
      };
    }

    return {
      status: true,
      data: result.data as StorageUsage,
    };
  } catch (error) {
    console.error("[Storage] Fetch error:", error);
    return {
      status: false,
      message: "Failed to fetch storage usage",
    };
  }
}
