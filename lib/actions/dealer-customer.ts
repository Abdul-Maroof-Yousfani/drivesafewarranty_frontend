"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";
import { Customer } from "./customer";
import { API_BASE } from "./constants";

function normalizeApiMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as any).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.filter(Boolean).join(", ");
  }
  return undefined;
}

export async function getDealerCustomersAction(): Promise<{
  status: boolean;
  data: Customer[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        data: [],
        message:
          normalizeApiMessage(errorData) ||
          `Failed with status ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json().catch(() => ({} as any));
    const customers: Customer[] = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
      ? result.data.data
      : [];

    return {
      status: !!result?.status,
      data: customers,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to fetch dealer customers:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch dealer customers",
    };
  }
}

export async function getDealerCustomerByIdAction(
  id: string
): Promise<{ status: boolean; data: Customer | null; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/${id}`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        data: null,
        message:
          normalizeApiMessage(errorData) ||
          `Failed with status ${res.status} ${res.statusText}`,
      };
    }
    const result = await res.json().catch(() => ({} as any));
    const customer: Customer | null =
      (result?.data as Customer | undefined) ?? null;
    return {
      status: !!result?.status,
      data: customer,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to fetch dealer customer:", error);
    return { status: false, data: null, message: "Failed to fetch customer" };
  }
}

export async function createDealerCustomerAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  // Legacy fields (optional)
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vin?: string | null;
  registrationNumber?: string | null;
  mileage?: number;
  // New vehicles array
  vehicles?: {
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage?: number;
    transmission?: "manual" | "automatic";
  }[];
  password: string;
}): Promise<{ status: boolean; data?: Customer; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({} as any));

    // Always return the result, even if status is not ok
    // The frontend will check result.status to determine success/failure
    if (!res.ok) {
      // If response is not ok, ensure status is false
      return {
        status: false,
        message:
          normalizeApiMessage(result) ||
          `Failed with status ${res.status} ${res.statusText}`,
        ...result,
      };
    }

    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath("/dealer/customers/list");
      });
    }
    return {
      status: !!result?.status,
      data: result?.data,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to create dealer customer:", error);
    return { status: false, message: "Failed to create customer" };
  }
}

export async function updateDealerCustomerAction(
  id: string,
  data: Partial<Customer>
): Promise<{ status: boolean; data?: Customer; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message:
          normalizeApiMessage(errorData) ||
          `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json().catch(() => ({} as any));
    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath(`/dealer/customers/view/${id}`);
        revalidatePath("/dealer/customers/list");
      });
    }
    return {
      status: !!result?.status,
      data: result?.data,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to update dealer customer:", error);
    return { status: false, message: "Failed to update customer" };
  }
}

// Vehicle Actions for Dealer

export async function createDealerCustomerVehicleAction(
  customerId: string,
  data: {
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage?: number;
    transmission?: "manual" | "automatic";
  }
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/${customerId}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message:
          normalizeApiMessage(errorData) ||
          `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json().catch(() => ({} as any));
    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath(`/dealer/customers/view/${customerId}`);
        revalidatePath(`/dealer/customers/edit/${customerId}`);
      });
    }
    return {
      status: !!result?.status,
      data: result?.data,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return { status: false, message: "Failed to create vehicle" };
  }
}

export async function updateDealerCustomerVehicleAction(
  vehicleId: string,
  data: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage?: number;
    transmission?: "manual" | "automatic";
  }
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/vehicles/${vehicleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message:
          normalizeApiMessage(errorData) ||
          `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json().catch(() => ({} as any));
    // We don't verify customer ID here easily for revalidation, but usually we just revalidate the page we are on
    return {
      status: !!result?.status,
      data: result?.data,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return { status: false, message: "Failed to update vehicle" };
  }
}

export async function deleteDealerCustomerVehicleAction(
  vehicleId: string
): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/vehicles/${vehicleId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message:
          normalizeApiMessage(errorData) ||
          `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json().catch(() => ({} as any));
    return {
      status: !!result?.status,
      message: normalizeApiMessage(result?.message) || result?.message,
    };
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return { status: false, message: "Failed to delete vehicle" };
  }
}
