"use server";

import { getAccessToken } from "@/lib/auth";
import { Customer } from "./customer";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function getDealerCustomersAction(): Promise<{
  status: boolean;
  data: Customer[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/customers`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
            status: false,
            data: [],
            message: errorData.message || `Failed with status ${res.status}`
        };
    }

    return res.json();
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
    const res = await fetch(`${API_BASE}/dealer/customers/${id}`, {
      cache: "no-store",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        data: null,
        message: (errorData as any).message || `Failed with status ${res.status}`,
      };
    }
    return res.json();
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
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vin?: string | null;
  registrationNumber?: string | null;
  mileage?: number;
  password: string;
}): Promise<{ status: boolean; data?: Customer; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath("/dealer/customers/list");
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to create dealer customer:", error);
    return { status: false, message: "Failed to create customer" };
  }
}
