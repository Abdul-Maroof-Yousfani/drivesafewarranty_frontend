"use server";

import { getAccessToken } from "@/lib/auth";

import { API_BASE } from "./constants";

export interface CustomerWarrantySale {
  id: string;
  policyNumber: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: string;
  planMonths?: number | null;
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
