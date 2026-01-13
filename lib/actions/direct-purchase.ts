"use server";

import { API_BASE } from "./constants";

export interface DirectPurchasePackage {
  id: string;
  name: string;
  description?: string | null;
  planLevel?: string | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  items?: Array<{
    id: string;
    type: "benefit" | "feature";
    warrantyItem: {
      id: string;
      label: string;
      description?: string | null;
      type: string;
    };
  }> | null;
}

export interface DirectPurchaseRequest {
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    registrationNumber?: string;
    mileage: number;
    transmission?: "manual" | "automatic";
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  warrantyPackageId: string;
  duration: 12 | 24 | 36;
  termsAccepted?: boolean;
}

export interface DirectPurchaseResponse {
  status: boolean;
  message?: string;
  data?: {
    customerId: string;
    customerEmail: string;
    vehicleId: string;
    warrantySaleId: string;
    policyNumber: string;
    invoiceId: string;
    invoiceNumber: string;
    temporaryPassword: string;
    coverageStartDate: string;
    coverageEndDate: string;
    totalAmount: number;
  };
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export interface EligiblePackagesRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission?: "manual" | "automatic";
}

/**
 * Get available warranty packages for direct purchase based on vehicle eligibility (PUBLIC)
 */
export async function getDirectPurchasePackagesAction(
  data: EligiblePackagesRequest
): Promise<ApiResponse<DirectPurchasePackage[]>> {
  try {
    const res = await fetch(`${API_BASE}/direct-customer/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: false,
        message: json.message || "Failed to load packages",
      };
    }

    return json;
  } catch (error) {
    return { status: false, message: "Failed to load packages" };
  }
}

/**
 * Complete a direct customer warranty purchase (PUBLIC - no auth required)
 */
export async function createDirectPurchaseAction(
  data: DirectPurchaseRequest
): Promise<DirectPurchaseResponse> {
  try {
    const res = await fetch(`${API_BASE}/direct-customer/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: false,
        message:
          json.message ||
          (Array.isArray(json.message) ? json.message.join(", ") : null) ||
          `Failed with status ${res.status}`,
      };
    }

    return json;
  } catch (error) {
    return { status: false, message: "Failed to complete purchase" };
  }
}
