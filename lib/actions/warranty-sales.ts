"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface WarrantySale {
  id: string;
  policyNumber: string;
  saleDate: string;
  status: string;
  warrantyPrice: string | number;
  warrantyPackage: {
    name: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  } | null;
  dealer?: {
    businessNameTrading: string | null;
    businessNameLegal: string;
  } | null;
  createdBy?: {
    firstName: string;
    lastName: string;
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
  dealerId?: string;
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
