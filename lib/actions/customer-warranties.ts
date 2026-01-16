"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";

import { API_BASE } from "./constants";

export interface CustomerWarrantySale {
  id: string;
  policyNumber: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: string;
  planMonths?: number | null;
  // Snapshot fields captured at sale time (immutable)
  packageName?: string | null;
  planLevel?: string | null;
  packageDescription?: string | null;
  packageEligibility?: string | null;
  excess?: number | null;
  labourRatePerHour?: number | null;
  dealerName?: string | null;
  fixedClaimLimit?: number | null;
  warrantyPrice?: number;
  saleDate: string;
  vehicle?: {
    id?: string;
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage?: number | null;
  } | null;
  warrantyPackage: {
    id: string;
    name: string;
    description?: string;
    planLevel?: string;
    eligibility?: string;
    coverageDuration: number;
    durationValue: number;
    durationUnit: string;
    items?: Array<{
      id: string;
      label?: string;
      type: "benefit" | "feature";
      warrantyItem: {
        id: string;
        label: string;
        type: string;
      };
    }> | null;
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    price?: number | null;
    price12Months?: number | null;
    price24Months?: number | null;
    price36Months?: number | null;
  };
  dealer?: {
    businessNameTrading?: string;
    businessNameLegal: string;
    email: string;
    phone: string;
  };
  benefits?: Array<{
    id: string;
    label?: string;
    type: "benefit" | "feature";
    warrantyItem: {
      id: string;
      label: string;
      type: string;
    };
  }> | null;
}

export async function getCustomerWarrantySalesAction(): Promise<{
  status: boolean;
  data: CustomerWarrantySale[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    
    // Inject Host header for backend portal validation
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customer/my-warranties`, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Failed to fetch customer warranties:", res.status, errorData);
      return {
        status: false,
        data: [],
        message: errorData.message || `Failed to fetch warranties (${res.status})`,
      };
    }

    const result = await res.json();
    
    // Ensure data is always an array
    if (result.status && Array.isArray(result.data)) {
      return {
        status: true,
        data: result.data,
        message: result.message,
      };
    }

    // Handle case where API returns data but not in expected format
    return {
      status: result.status || false,
      data: Array.isArray(result.data) ? result.data : [],
      message: result.message || "Invalid response format",
    };
  } catch (error) {
    console.error("Failed to fetch customer warranties:", error);
    return {
      status: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch warranties",
    };
  }
}
