"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function getDealerWarrantySalesAction(): Promise<{
  status: boolean;
  data: any[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/warranty-sales`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch dealer warranty sales:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch dealer warranty sales",
    };
  }
}

export async function createDealerWarrantySaleAction(payload: {
  customerId: string;
  warrantyPackageId: string;
  price: number;
  duration?: number;
}): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/warranty-sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (error) {
    console.error("Failed to create dealer warranty sale:", error);
    return { status: false, message: "Failed to create dealer warranty sale" };
  }
}
