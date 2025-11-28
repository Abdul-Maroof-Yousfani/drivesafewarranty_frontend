"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface LeavesPolicy {
  id: string;
  name: string;
  details?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getLeavesPolicies(): Promise<{ status: boolean; data: LeavesPolicy[] }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to fetch leave policies:", error);
    return { status: false, data: [] };
  }
}

export async function createLeavesPolicy(formData: FormData): Promise<{ status: boolean; message: string; data?: LeavesPolicy }> {
  const name = formData.get("name") as string;
  const details = formData.get("details") as string;
  if (!name?.trim()) {
    return { status: false, message: "Name is required" };
  }
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ name, details }),
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to create leave policy" };
  }
}

export async function createLeavesPolicies(
  items: { name: string; details?: string }[]
): Promise<{ status: boolean; message: string }> {
  if (!items.length) return { status: false, message: "At least one leave policy is required" };
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to create leave policies" };
  }
}

export async function updateLeavesPolicy(id: string, formData: FormData): Promise<{ status: boolean; message: string; data?: LeavesPolicy }> {
  const name = formData.get("name") as string;
  const details = formData.get("details") as string;
  if (!name?.trim()) return { status: false, message: "Name is required" };
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ name, details }),
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to update leave policy" };
  }
}

export async function deleteLeavesPolicy(id: string): Promise<{ status: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies/${id}`, {
      method: "DELETE",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to delete leave policy" };
  }
}

export async function deleteLeavesPolicies(ids: string[]): Promise<{ status: boolean; message: string }> {
  if (!ids.length) return { status: false, message: "No items to delete" };
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to delete leave policies" };
  }
}

export async function updateLeavesPolicies(
  items: { id: string; name: string; details?: string }[]
): Promise<{ status: boolean; message: string }> {
  if (!items.length) return { status: false, message: "No items to update" };
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/leaves-policies/bulk`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (data.status) revalidatePath("/dashboard/master/leaves-policy");
    return data;
  } catch (error) {
    return { status: false, message: "Failed to update leave policies" };
  }
}

