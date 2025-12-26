"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

export interface CustomerWarrantySale {
  id: string;
  policyNumber: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: string;
  planMonths?: number | null;
  warrantyPackage: {
    id: string;
    name: string;
    description?: string;
    planLevel?: string;
    eligibility?: string;
    coverageDuration: number;
    durationUnit: string;
    includedFeatures?: any; // JSON
    keyBenefits?: any; // JSON
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    price?: number | null;
  };
  warrantyPrice?: number;
  dealer?: {
    businessNameTrading?: string;
    businessNameLegal: string;
    email: string;
    phone: string;
  };
}

export async function getCustomerWarrantySalesAction(): Promise<{
  status: boolean;
  data: CustomerWarrantySale[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/customer/my-warranties`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch customer warranties:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch warranties",
    };
  }
}
