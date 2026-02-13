"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  warrantySaleId: string;
  dealerId: string;
  amount: string | number;
  tax?: string | number | null;
  totalAmount: string | number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  invoiceDate: string;
  dueDate: string;
  paidDate?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  dealer?: {
    id: string;
    businessNameLegal: string;
    businessNameTrading?: string | null;
    email?: string;
    phone?: string;
    businessAddress?: string;
  } | null;
  warrantySale?: {
    id: string;
    policyNumber: string;
    warrantyPrice: string | number;
    saleDate?: string;
    coverageStartDate?: string;
    coverageEndDate?: string;
    dealerCost12Months?: number | null;
    dealerCost24Months?: number | null;
    dealerCost36Months?: number | null;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      address?: string;
    } | null;
    vehicle?: {
      make: string;
      model: string;
      year: number;
      vin?: string | null;
      registrationNumber?: string | null;
    } | null;
    warrantyPackage?: {
      id: string;
      name: string;
      description?: string | null;
      planLevel?: string | null;
    } | null;
    dealer?: {
      id: string;
      businessNameLegal: string;
      businessNameTrading?: string | null;
      email?: string;
      phone?: string;
      businessAddress?: string;
    } | null;
  } | null;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all invoices (Super Admin/Admin only)
 */
export async function getAllInvoicesAction(params?: {
  page?: number;
  limit?: number;
  search?: string;
  dealerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  excludeDirectSales?: boolean;
}): Promise<{ status: boolean; data?: InvoiceListResponse; message?: string }> {
  try {
    const token = await getAccessToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.dealerId) queryParams.append("dealerId", params.dealerId);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.excludeDirectSales) queryParams.append("excludeDirectSales", "true");

    const url = `${API_BASE}/invoices${
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
    console.error("Failed to fetch invoices:", error);
    return {
      status: false,
      message: "Failed to fetch invoices",
    };
  }
}

export async function getDealerInvoicesAction(params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ status: boolean; data?: InvoiceListResponse; message?: string }> {
  try {
    const token = await getAccessToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = `${API_BASE}/invoices/dealer${
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
    console.error("Failed to fetch dealer invoices:", error);
    return {
      status: false,
      message: "Failed to fetch dealer invoices",
    };
  }
}

export async function getInvoiceByIdAction(
  id: string,
  dealerId?: string
): Promise<{ status: boolean; data?: Invoice; message?: string }> {
  try {
    const token = await getAccessToken();
    const queryParams = new URLSearchParams();
    if (dealerId) queryParams.append("dealerId", dealerId);
    const url = `${API_BASE}/invoices/${id}${
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
    console.error("Failed to fetch invoice:", error);
    return { status: false, message: "Failed to fetch invoice" };
  }
}

export async function updateInvoiceAction(
  id: string,
  payload: {
    status?: "pending" | "paid" | "overdue" | "cancelled";
    paymentMethod?: string;
    paidDate?: string | null;
    notes?: string;
  },
  dealerId?: string
): Promise<{ status: boolean; data?: Invoice; message?: string }> {
  try {
    const token = await getAccessToken();
    const queryParams = new URLSearchParams();
    if (dealerId) queryParams.append("dealerId", dealerId);
    const url = `${API_BASE}/invoices/${id}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
      body: JSON.stringify(payload),
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
    console.error("Failed to update invoice:", error);
    return { status: false, message: "Failed to update invoice" };
  }
}

/**
 * Get dealer invoice statistics
 */
export async function getDealerInvoiceStatisticsAction(
  dealerId: string
): Promise<{
  status: boolean;
  data?: {
    totalAmount: number;
    totalCount: number;
    pendingAmount: number;
    pendingCount: number;
    paidAmount: number;
    paidCount: number;
  };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/invoices/statistics/dealer/${dealerId}`, {
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
    console.error("Failed to fetch dealer statistics:", error);
    return { status: false, message: "Failed to fetch dealer statistics" };
  }
}
