"use server";

import { headers } from "next/headers";
import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface ActivityLog {
  id: string;
  userId: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  action: string;
  module: string | null;
  entity: string | null;
  entityId: string | null;
  description: string | null;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export interface ActivityLogListResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all activity logs (Admin only)
 */
export async function getActivityLogsAction(params?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ status: boolean; data?: ActivityLogListResponse; message?: string }> {
  try {
    const token = await getAccessToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.action && params.action !== "all") queryParams.append("action", params.action);
    if (params?.module && params.module !== "all") queryParams.append("module", params.module);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = `${API_BASE}/activity-logs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return {
      status: false,
      message: "Failed to fetch activity logs",
    };
  }
}
