"use server";

import { headers } from "next/headers";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface Customer {
  id: string;
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
  mileage: number;
  // New vehicles array
  vehicles?: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage: number;
    transmission?: "manual" | "automatic" | null;
    dvlaTaxStatus?: string | null;
    dvlaTaxDueDate?: string | null;
    dvlaMotStatus?: string | null;
    dvlaMotExpiryDate?: string | null;
    dvlaYearOfManufacture?: number | null;
    dvlaEngineCapacity?: number | null;
    dvlaCo2Emissions?: number | null;
    dvlaFuelType?: string | null;
    dvlaMarkedForExport?: boolean | null;
    dvlaColour?: string | null;
    dvlaTypeApproval?: string | null;
    dvlaDateOfLastV5CIssued?: string | null;
    dvlaWheelplan?: string | null;
    dvlaMonthOfFirstRegistration?: string | null;
  }[];
  status: string;
  dealerId?: string | null;
  dealerName?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  currentWarranty?: {
    id: string;
    policyNumber: string;
    status: string;
    coverageStartDate: string;
    coverageEndDate: string;
    planMonths?: number | null;
    warrantyPackage: {
      id: string;
      name: string;
      planLevel?: string | null;
    };
    vehicle?: {
      make: string;
      model: string;
      year: number;
    } | null;
    dealerName?: string | null;
  } | null;
}

// Customer Actions
export async function getCustomers(dealerId?: string): Promise<{
  status: boolean;
  data: Customer[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const queryParams = new URLSearchParams();
    if (dealerId) queryParams.append("dealerId", dealerId);

    const res = await fetch(`${API_BASE}/customers?${queryParams.toString()}`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    const result = await res.json();

    // Handle ResponseInterceptor format: { status: true, data: { data: [...], meta: ... } }
    let customers: Customer[] = [];

    if (result.status && result.data) {
      if (Array.isArray(result.data)) {
        customers = result.data;
      } else if (result.data.data && Array.isArray(result.data.data)) {
        customers = result.data.data;
      }
    }

    return {
      status: result.status,
      message: result.message,
      data: customers,
    };
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return { status: false, data: [], message: "Failed to fetch customers" };
  }
}

export async function getCustomerById(
  id: string,
  dealerId?: string,
): Promise<{ status: boolean; data: Customer | null; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const queryParams = new URLSearchParams();
    if (dealerId) queryParams.append("dealerId", dealerId);
    const queryString = queryParams.toString();

    const res = await fetch(`${API_BASE}/customers/${id}${queryString ? `?${queryString}` : ''}`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: "Failed to fetch customer" }));
      return {
        status: false,
        data: null,
        message: errorData.message || `HTTP error! status: ${res.status}`,
      };
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return {
      status: false,
      data: null,
      message:
        error instanceof Error ? error.message : "Failed to fetch customer",
    };
  }
}

export async function createCustomer(data: {
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
  dealerId?: string | null;
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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json();
    if (result.status) {
      revalidatePath("/super-admin/customers");
    }
    return result;
  } catch (error) {
    console.error("Failed to create customer:", error);
    return { status: false, message: "Failed to create customer" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vin?: string | null;
    registrationNumber?: string | null;
    mileage?: number;
    dealerId?: string | null;
    status?: string;
  }
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
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json();
    if (result.status) {
      revalidatePath("/super-admin/customers");
    }
    return result;
  } catch (error) {
    console.error("Failed to update customer:", error);
    return { status: false, message: "Failed to update customer" };
  }
}

export async function deleteCustomer(
  id: string
): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/${id}`, {
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
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json();
    if (result.status) {
      revalidatePath("/super-admin/customers");
    }
    return result;
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return { status: false, message: "Failed to delete customer" };
  }
}

export async function deleteCustomers(
  ids: string[]
): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/customers/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    const result = await res.json();
    if (result.status) {
      revalidatePath("/super-admin/customers");
    }
    return result;
  } catch (error) {
    console.error("Failed to delete customers:", error);
    return { status: false, message: "Failed to delete customers" };
  }
}

// Vehicle Actions for Super Admin

export async function createCustomerVehicleAction(
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
    const result = await res.json();
    if (result.status) {
      revalidatePath("/super-admin/customers");
    }
    return result;
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return { status: false, message: "Failed to create vehicle" };
  }
}

export async function updateCustomerVehicleAction(
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
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return { status: false, message: "Failed to update vehicle" };
  }
}

export async function deleteCustomerVehicleAction(
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
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return { status: false, message: "Failed to delete vehicle" };
  }
}
