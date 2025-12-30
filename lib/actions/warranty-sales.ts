"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

export interface WarrantySale {
  id: string;
  policyNumber: string;
  saleDate: string;
  status: string;
  dealerId?: string | null;
  customerId?: string | null;
  warrantyPrice: string | number;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  // Dealer cost fields - what SA charged the dealer
  dealerCost12Months?: number | null;
  dealerCost24Months?: number | null;
  dealerCost36Months?: number | null;
  coverageStartDate: string;
  coverageEndDate: string;
  paymentMethod: string;
  customerConsent?: boolean;
  mileageAtSale?: number | null;
  vehicleId?: string | null;
  warrantyPackage: {
    id: string;
    name: string;
    planLevel?: string | null;
    price12Months?: number | null;
    price24Months?: number | null;
    price36Months?: number | null;
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    // Dealer pricing from package
    dealerPrice12Months?: number | null;
    dealerPrice24Months?: number | null;
    dealerPrice36Months?: number | null;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    address?: string; // Added
  } | null;
  dealer?: {
    phone: string;
    id: string;
    businessNameTrading: string | null;
    businessNameLegal: string;
    businessAddress?: string; // Added
    email?: string; // Added
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
  } | null;
}

export async function getWarrantySalesAction(): Promise<{
  status: boolean;
  data: WarrantySale[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/warranty-sales`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch warranty sales:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch warranty sales",
    };
  }
}

export async function getWarrantySaleByIdAction(
  id: string
): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch warranty sale:", error);
    return { status: false, message: "Failed to fetch warranty sale" };
  }
}

export async function updateWarrantySaleAction(
  id: string,
  payload: {
    salesRepresentativeName?: string;
    warrantyPrice?: number;
    paymentMethod?: string;
    coverageStartDate?: string;
    coverageEndDate?: string;
    status?: string;
  }
): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (error) {
    console.error("Failed to update warranty sale:", error);
    return { status: false, message: "Failed to update warranty sale" };
  }
}

export async function deleteWarrantySaleAction(
  id: string
): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
      method: "DELETE",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to delete warranty sale:", error);
    return { status: false, message: "Failed to delete warranty sale" };
  }
}

export async function createMasterWarrantySaleAction(payload: {
  customerId: string;
  warrantyPackageId: string;
  price: number;
  duration?: number;
  dealerId?: string;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  paymentMethod?: string;
  customerConsent?: boolean;
  mileageAtSale?: number | null;
  coverageStartDate?: string;
  vehicleId?: string;
}): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/warranty-sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (error) {
    console.error("Failed to create warranty sale:", error);
    return { status: false, message: "Failed to create warranty sale" };
  }
}
