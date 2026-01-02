"use server";

import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

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

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, data: [], message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

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

export interface CreateDealerWarrantySalePayload {
  customerId: string;
  vehicleId?: string | null;
  warrantyPackageId: string;
  // Price is optional - backend uses fixed customer price from package (SA controlled)
  price?: number;
  duration?: number;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  customerConsent?: boolean;
  customerSignature?: string | null;
  mileageAtSale?: number | null;
  salesRepresentativeName?: string | null;
  paymentMethod?: string;
  coverageStartDate?: string;
}

export async function createDealerWarrantySaleAction(
  payload: CreateDealerWarrantySalePayload
): Promise<{ status: boolean; data?: any; message?: string }> {
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

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to create dealer warranty sale:", error);
    return { status: false, message: "Failed to create dealer warranty sale" };
  }
}
