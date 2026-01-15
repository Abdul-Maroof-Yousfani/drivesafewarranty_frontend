"use server";

import { cookies, headers } from "next/headers";
import { API_BASE } from "./constants";

export interface WarrantyItem {
  id: string;
  label: string;
  description?: string | null;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export async function getWarrantyItemsAction(): Promise<ApiResponse<WarrantyItem[]>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) {
    return { status: false, message: "Not authenticated" };
  }
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-items`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load warranty items" };
  }
}

export async function createWarrantyItemAction(payload: {
  label: string;
  type: string;
  description?: string;
}): Promise<ApiResponse<WarrantyItem>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: false,
        message: json.message || "Failed to create warranty item",
      };
    }

    return json;
  } catch (error) {
    return { status: false, message: "Network error or server unreachable" };
  }
}

export async function updateWarrantyItemAction(
  id: string,
  payload: {
    label?: string;
    type?: string;
    description?: string;
    status?: string;
  }
): Promise<ApiResponse<WarrantyItem>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: false,
        message: json.message || "Failed to update warranty item",
      };
    }

    return json;
  } catch (error) {
    return { status: false, message: "Network error or server unreachable" };
  }
}

export async function deleteWarrantyItemAction(
  id: string
): Promise<{ status: boolean; message: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: false,
        message: json.message || "Failed to delete warranty item",
      };
    }

    return json;
  } catch (error) {
    return { status: false, message: "Failed to delete warranty item" };
  }
}
