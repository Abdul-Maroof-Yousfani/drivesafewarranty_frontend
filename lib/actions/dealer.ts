"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { WarrantyPackage } from "@/lib/actions/warranty-package";
import { API_BASE } from "./constants";

export interface Dealer {
  id: string;
  businessNameLegal: string;
  businessNameTrading?: string | null;
  businessAddress: string;
  contactPersonName: string;
  phone: string;
  email: string;
  dealerLicenseNumber?: string | null;
  businessRegistrationNumber?: string | null;
  bankDetails?: { bankName: string; accountNumber: string; accountHolderName: string; routingNumber?: string; } | null;
  authorizedSignatory?: { name: string; title: string; email?: string; phone?: string; } | null;
  dealerAgreementSigned: boolean;
  onboardingDate?: Date | string | null;
  status: string;
  databaseName?: string | null;
  username?: string | null;
  credentialsGeneratedAt?: Date | string | null;
  excelFilePath?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  totalCustomers?: number;
  totalWarranties?: number;
  amountPaid?: number;
  amountReceived?: number;
  warrantyPackages?: WarrantyPackage[];
  dealerStorage?: {
    usedBytes: string;
    limitBytes: string;
    lastCalculated: Date | string;
  } | null;
}

export interface CreateDealerResponse {
  dealer: Dealer;
  user: {
    id: string;
    email: string;
  };
}

export interface DealerLoginCredentials {
  email: string;
  password: string;
  loginUrl: string;
  businessName?: string;
}

export async function getDealers(): Promise<{ status: boolean; data?: Dealer[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Failed to fetch dealers" }));
      return {
        status: false,
        data: [],
        message: errorData.message || `HTTP error! status: ${res.status}`,
      };
    }

    const result = await res.json();

    // Backend currently returns:
    // { status: true, data: { dealers: Dealer[], total, page, limit, totalPages } }
    // Normalize so that frontend always gets Dealer[] in data
    let dealers: Dealer[] = [];

    // Debug logging
    console.log("getDealers API Response Data Keys:", Object.keys(result?.data || {}));

    if (Array.isArray(result?.data)) {
      console.log("getDealers: result.data is Array");
      dealers = result.data as Dealer[];
    } else if (Array.isArray(result?.data?.data)) {
      console.log("getDealers: result.data.data is Array (Correct for new Interceptor)");
      dealers = result.data.data as Dealer[];
    } else if (Array.isArray(result?.data?.dealers)) {
         console.log("getDealers: result.data.dealers is Array (Legacy)");
         dealers = result.data.dealers as Dealer[];
    } else {
        console.warn("getDealers: Could not find dealers array in response", result);
    }

    return {
      status: !!result.status,
      data: dealers,
      message: result.message,
    };
  } catch (error) {
    console.error("Failed to fetch dealers:", error);
    return { status: false, data: [], message: error instanceof Error ? error.message : "Failed to fetch dealers" };
  }
}

export async function getDealerById(id: string): Promise<{ status: boolean; data?: Dealer | null; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers/${id}`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch dealer' }));
      return { status: false, data: null, message: errorData.message || `HTTP error! status: ${res.status}` };
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch dealer:", error);
    return { status: false, data: null, message: error instanceof Error ? error.message : "Failed to fetch dealer" };
  }
}

export async function createDealer(data: {
  legalName: string;
  tradingName?: string;
  businessAddress: string;
  contactPersonName: string;
  phone: string;
  email: string;
  dealerLicenseNumber?: string;
  businessRegistrationNumber?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingNumber?: string;
  };
  authorizedSignatory?: {
    name: string;
    title: string;
    email?: string;
    phone?: string;
  };
  dealerAgreementSigned: boolean;
  onboardingDate: Date | string;
  password: string; // Password set by Super Admin
}): Promise<{ status: boolean; data?: CreateDealerResponse; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    
    if (result.status) {
      revalidatePath("/super-admin/dealers");
    }
    
    return result;
  } catch (error) {
    console.error("Failed to create dealer:", error);
    return { status: false, message: error instanceof Error ? error.message : "Failed to create dealer" };
  }
}

export async function updateDealer(
  id: string,
  data: Partial<{
    businessNameLegal: string;
    businessNameTrading?: string;
    businessAddress: string;
    contactPersonName: string;
    phone: string;
    email: string;
    dealerLicenseNumber?: string;
    businessRegistrationNumber?: string;
    bankDetails?: object;
    authorizedSignatory?: object;
    dealerAgreementSigned: boolean;
    onboardingDate: Date | string;
    status: string;
  }>
): Promise<{ status: boolean; data?: Dealer; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    
    if (result.status) {
      revalidatePath("/super-admin/dealers");
    }
    
    return result;
  } catch (error) {
    console.error("Failed to update dealer:", error);
    return { status: false, message: error instanceof Error ? error.message : "Failed to update dealer" };
  }
}

export async function deleteDealer(id: string): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { status: false, message: errorData.message || `Error: ${res.status} ${res.statusText}` };
    }

    const result = await res.json();
    
    if (result.status) {
      revalidatePath("/super-admin/dealers");
    }
    
    return result;
  } catch (error) {
    console.error("Failed to delete dealer:", error);
    return { status: false, message: error instanceof Error ? error.message : "Failed to delete dealer" };
  }
}

export async function downloadDealerCredentials(id: string): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers/${id}/credentials/download`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to download credentials' }));
      return { status: false, message: errorData.message || 'Failed to download credentials' };
    }
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = res.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `dealer-credentials-${id}.xlsx`;
    
    // Create blob and download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { status: true };
  } catch (error) {
    console.error("Failed to download credentials:", error);
    return { status: false, message: error instanceof Error ? error.message : "Failed to download credentials" };
  }
}

export async function verifyDealerCredentials(
  id: string,
  adminPassword: string
): Promise<{ status: boolean; data?: DealerLoginCredentials; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealers/${id}/verify-credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify({ adminPassword }),
    });

    const result = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return {
        status: false,
        message: result?.message || result?.data?.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    const candidate =
      (result?.data?.email ? result.data : undefined) ||
      (result?.data?.data?.email ? result.data.data : undefined) ||
      (result?.data?.data?.data?.email ? result.data.data.data : undefined);

    return {
      status: !!result?.status,
      data: candidate as DealerLoginCredentials | undefined,
      message: result?.message || result?.data?.message,
    };
  } catch (error) {
    console.error("Failed to verify dealer credentials:", error);
    return {
      status: false,
      message: error instanceof Error ? error.message : "Failed to verify dealer credentials",
    };
  }
}

