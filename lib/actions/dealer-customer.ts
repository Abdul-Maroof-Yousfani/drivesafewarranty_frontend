"use server";

import { getAccessToken } from "@/lib/auth";
import { Customer } from "./customer";
import { API_BASE } from "./constants";

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
  }[];
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
    
    // Always return the result, even if status is not ok
    // The frontend will check result.status to determine success/failure
    if (!res.ok) {
      // If response is not ok, ensure status is false
      return {
        status: false,
        message: result.message || `Failed with status ${res.status}`,
        ...result,
      };
    }
    
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

export async function updateDealerCustomerAction(
  id: string,
  data: Partial<Customer>
): Promise<{ status: boolean; data?: Customer; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath(`/dealer/customers/view/${id}`);
        revalidatePath("/dealer/customers/list");
      });
    }
    return result;
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
  }
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/customers/${customerId}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    if (result.status) {
      import("next/cache").then(({ revalidatePath }) => {
        revalidatePath(`/dealer/customers/view/${customerId}`);
        revalidatePath(`/dealer/customers/edit/${customerId}`);
      });
    }
    return result;
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
  }
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}/dealer/vehicles/${vehicleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    // We don't verify customer ID here easily for revalidation, but usually we just revalidate the page we are on
    return result;
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
    const res = await fetch(`${API_BASE}/dealer/vehicles/${vehicleId}`, {
      method: "DELETE",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return { status: false, message: "Failed to delete vehicle" };
  }
}
