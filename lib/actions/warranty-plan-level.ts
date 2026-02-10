"use server";

import { cookies, headers } from "next/headers";
import { API_BASE } from "./constants";

export interface WarrantyPlanLevel {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  benefits?: Array<{
    id: string;
    warrantyItemId: string;
    warrantyItem?: {
      id: string;
      label: string;
      description?: string | null;
      type: string;
    } | null;
  }> | null;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export async function getWarrantyPlanLevelsAction(): Promise<
  ApiResponse<WarrantyPlanLevel[]>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-plan-levels`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return {
        status: false,
        message: json.message || "Failed to load plan levels",
      };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { status: false, message: "Failed to load plan levels" };
  }
}

export async function getWarrantyPlanLevelByIdAction(
  id: string
): Promise<ApiResponse<WarrantyPlanLevel>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-plan-levels/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return {
        status: false,
        message: json.message || "Failed to load plan level",
      };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { status: false, message: "Failed to load plan level" };
  }
}

export async function createWarrantyPlanLevelAction(payload: {
  name: string;
  description?: string;
  benefitIds?: string[];
}): Promise<ApiResponse<WarrantyPlanLevel>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-plan-levels`, {
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
        message:
          json.message ||
          json.error ||
          `Failed with status ${res.status} ${res.statusText}`,
      };
    }

    return json;
  } catch (error) {
    return {
      status: false,
      message: "Failed to create plan level",
    };
  }
}

export async function updateWarrantyPlanLevelAction(
  id: string,
  payload: {
    name?: string;
    description?: string;
    benefitIds?: string[];
  }
): Promise<ApiResponse<WarrantyPlanLevel>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-plan-levels/${id}`, {
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
        message: json.message || "Failed to update plan level",
      };
    }

    return json;
  } catch (error) {
    return {
      status: false,
      message: "Failed to update plan level",
    };
  }
}

export async function deleteWarrantyPlanLevelAction(
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

    const res = await fetch(`${API_BASE}/warranty-plan-levels/${id}`, {
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
        message: json.message || "Failed to delete plan level",
      };
    }

    return json;
  } catch (error) {
    return {
      status: false,
      message: "Failed to delete plan level",
    };
  }
}

export async function deleteWarrantyPlanLevelsAction(
  ids: string[]
): Promise<{ status: boolean; message: string }> {
  if (!ids.length) return { status: false, message: "No items to delete" };
  try {
    const results = await Promise.all(
      ids.map((id) => deleteWarrantyPlanLevelAction(id))
    );
    const failed = results.filter((r) => !r.status);
    if (failed.length > 0) {
      return {
        status: false,
        message: `${failed.length} plan level(s) failed to delete`,
      };
    }
    return {
      status: true,
      message: `${results.length} plan level(s) deleted successfully`,
    };
  } catch (error) {
    return { status: false, message: "Failed to delete plan levels" };
  }
}


