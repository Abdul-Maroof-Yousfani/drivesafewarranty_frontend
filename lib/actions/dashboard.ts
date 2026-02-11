"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";

import { API_BASE } from "./constants";

export async function getSuperAdminDashboardStatsAction(): Promise<{
  status: boolean;
  data?: {
    totalDealers: number;
    totalCustomers: number;
    totalWarranties: number;
    totalEarnings: number;
    pendingInvoices: number;
    pendingInvoicesAmount?: number;
    totalPackages: number;
    recentCustomers: Array<{
      id: string;
      name: string;
      email: string;
      warrantyPackage: string;
      date: string;
    }>;
    topPackages: Array<{ name: string; sales: number }>;
    topDealers: Array<{ name: string; revenue: number; policies?: number; pendingRevenue?: number }>;
  };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dashboard/super-admin`, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load dashboard" };
  }
}

export async function getDealerDashboardStatsAction(): Promise<{
  status: boolean;
  data?: {
    totalCustomers: number;
    totalWarranties: number;
    totalEarnings?: number;
    totalRevenue?: number;
    amountOwed?: number;
    profit?: number;
    pendingInvoices: number;
    pendingInvoicesAmount?: number;
    status?: string;
  };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dashboard/dealer`, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load dashboard" };
  }
}

export async function getCustomerDashboardStatsAction(): Promise<{
  status: boolean;
  data?: { warranties: any[]; count: number };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dashboard/customer`, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load dashboard" };
  }
}
