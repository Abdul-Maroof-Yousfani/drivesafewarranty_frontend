"use server";

import { getAccessToken } from "@/lib/auth";
import { Customer } from "./customer";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function getDealerCustomersAction(): Promise<{
  status: boolean;
  data: Customer[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/customers`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            status: false,
            data: [],
            message: errorData.message || `Failed with status ${res.status}`
        };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch dealer customers:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch dealer customers",
    };
  }
}
