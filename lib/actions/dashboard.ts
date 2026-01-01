"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

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
  };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dashboard/super-admin`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
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
  };
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dashboard/dealer`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
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
    const res = await fetch(`${API_BASE}/dashboard/customer`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load dashboard" };
  }
}
