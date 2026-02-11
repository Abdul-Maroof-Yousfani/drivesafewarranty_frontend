"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface WarrantySale {
  id: string;
  policyNumber: string;
  saleDate: string;
  status: string;
  dealerId?: string | null;
  customerId?: string | null;
  // Snapshot fields: capture package info at sale time for immutability
  packageName?: string | null;
  planLevel?: string | null;
  packageDescription?: string | null;
  packageEligibility?: string | null;
  warrantyPrice: string | number;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  planMonths?: number | null;
  dealerName?: string | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  // Dealer cost fields - what SA charged the dealer
  dealerCost12Months?: number | null;
  dealerCost24Months?: number | null;
  dealerCost36Months?: number | null;
  coverageStartDate: string;
  coverageEndDate: string;
  paymentMethod: string;
  customerConsent?: boolean;
  mileageAtSale?: number | null;
  vehicleId?: string | null;
  warrantyPackage: {
    id: string;
    name: string;
    description?: string | null;
    planLevel?: string | null;
    eligibility?: string | null;
    price12Months?: number | null;
    price24Months?: number | null;
    price36Months?: number | null;
    excess?: number | null;
    labourRatePerHour?: number | null;
    fixedClaimLimit?: number | null;
    // Dealer pricing from package
    dealerPrice12Months?: number | null;
    dealerPrice24Months?: number | null;
    dealerPrice36Months?: number | null;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    address?: string; // Added
  } | null;
  dealer?: {
    phone: string;
    id: string;
    businessNameTrading: string | null;
    businessNameLegal: string;
    businessAddress?: string; // Added
    email?: string; // Added
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string | null;
    registrationNumber?: string | null;

  } | null;
  invoices?: {
    id: string;
    invoiceNumber: string;
    status: string;
  }[];
  benefits?: Array<{
    id: string;
    label?: string;
    type: string;
    warrantyItem?: {
      id: string;
      label: string;
      type: string;
    };
  }>;
}

export async function getWarrantySalesAction(): Promise<{
  status: boolean;
  data: WarrantySale[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales`, {
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
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch warranty sales:", error);
    return {
      status: false,
      data: [],
      message: "Failed to fetch warranty sales",
    };
  }
}

export async function getWarrantyAssignmentsAction(dealerId?: string): Promise<{
  status: boolean;
  data: any[];
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const query = dealerId ? `?dealerId=${dealerId}` : '';
    const res = await fetch(`${API_BASE}/warranty-packages/assignments/list${query}`, {
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
          message: errorData.message || `Error: ${res.status} ${res.statusText}`,
        };
      }
  
      return res.json();
    } catch (error) {
      console.error("Failed to fetch warranty assignments:", error);
      return {
        status: false,
        data: [],
        message: "Failed to fetch warranty assignments",
      };
    }
  }

export async function getWarrantyAssignmentByIdAction(id: string): Promise<{
    status: boolean;
    data?: any;
    message?: string;
}> {
    try {
        const token = await getAccessToken();
        const headersList = await headers();
        const host = headersList.get("host") || "";

        const res = await fetch(`${API_BASE}/warranty-packages/assignments/${id}`, {
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
                message: errorData.message || `Error: ${res.status} ${res.statusText}`,
            };
        }

        return res.json();
    } catch (error) {
        console.error("Failed to fetch warranty assignment:", error);
        return {
            status: false,
            message: "Failed to fetch warranty assignment",
        };
    }
}

export async function updateWarrantyAssignmentAction(
    id: string,
    payload: {
        dealerPrice12Months?: number;
        dealerPrice24Months?: number;
        dealerPrice36Months?: number;
        price?: number;
    }
): Promise<{ status: boolean; data?: any; message?: string }> {
    try {
        const token = await getAccessToken();
        const headersList = await headers();
        const host = headersList.get("host") || "";

        const res = await fetch(`${API_BASE}/warranty-packages/assignments/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                Host: host,
                "X-Forwarded-Host": host,
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
        console.error("Failed to update warranty assignment:", error);
        return {
            status: false,
            message: "Failed to update warranty assignment",
        };
    }
}


export async function getWarrantySaleByIdAction(
  id: string
): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
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
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch warranty sale:", error);
    return { status: false, message: "Failed to fetch warranty sale" };
  }
}

export async function updateWarrantySaleAction(
  id: string,
  payload: {
    salesRepresentativeName?: string;
    warrantyPrice?: number;
    paymentMethod?: string;
    coverageStartDate?: string;
    coverageEndDate?: string;
    status?: string;
  }
): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
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
    console.error("Failed to update warranty sale:", error);
    return { status: false, message: "Failed to update warranty sale" };
  }
}

export async function deleteWarrantySaleAction(
  id: string
): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales/${id}`, {
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

    return res.json();
  } catch (error) {
    console.error("Failed to delete warranty sale:", error);
    return { status: false, message: "Failed to delete warranty sale" };
  }
}

export async function createMasterWarrantySaleAction(payload: {
  customerId: string;
  warrantyPackageId: string;
  price: number;
  duration?: number;
  dealerId?: string;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  paymentMethod?: string;
  customerConsent?: boolean;
  mileageAtSale?: number | null;
  coverageStartDate?: string;
  vehicleId?: string;
}): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
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
    console.error("Failed to create warranty sale:", error);
    return { status: false, message: "Failed to create warranty sale" };
  }
}

export async function toggleWarrantySaleStatusAction(
  id: string
): Promise<{ status: boolean; data?: WarrantySale; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-sales/${id}/status`, {
      method: "PATCH",
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

    return res.json();
  } catch (error) {
    console.error("Failed to toggle warranty sale status:", error);
    return { status: false, message: "Failed to toggle warranty sale status" };
  }
}

export async function toggleWarrantyAssignmentStatusAction(
  id: string
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/assignments/${id}/status`, {
      method: "PATCH",
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

    return res.json();
  } catch (error) {
    console.error("Failed to toggle warranty assignment status:", error);
    return { status: false, message: "Failed to toggle warranty assignment status" };
  }
}
