"use server";

import { headers } from "next/headers";
import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface CustomerDocument {
  id: string;
  name: string;
  description: string | null;
  fileId: string;
  file: {
    id: string;
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  };
  customerId: string;
  dealerId: string | null;
  createdById: string | null;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all documents for a customer
 */
export async function getCustomerDocumentsAction(customerId: string): Promise<{ status: boolean; data?: CustomerDocument[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/${customerId}`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
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
    return {
      status: true,
      data: result.data || result
    };
  } catch (error) {
    console.error("Failed to fetch customer documents:", error);
    return { status: false, message: "Failed to fetch customer documents" };
  }
}

/**
 * Get all documents (Super Admin only)
 */
export async function getAllDocumentsAction(): Promise<{ status: boolean; data?: any[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/all`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
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
    return {
      status: true,
      data: result.data || result
    };
  } catch (error) {
    console.error("Failed to fetch all documents:", error);
    return { status: false, message: "Failed to fetch all documents" };
  }
}

/**
 * Get documents for current dealer
 */
export async function getDealerDocumentsAction(): Promise<{ status: boolean; data?: any[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/mine`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
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
    return {
      status: true,
      data: result.data || result
    };
  } catch (error) {
    console.error("Failed to fetch dealer documents:", error);
    return { status: false, message: "Failed to fetch dealer documents" };
  }
}

/**
 * Get documents for the current logged-in customer
 */
export async function getMyDocumentsAction(): Promise<{ status: boolean; data?: any[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/me`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      cache: "no-store",
      headers: { 
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
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
    return {
      status: true,
      data: result.data || result
    };
  } catch (error) {
    console.error("Failed to fetch my documents:", error);
    return { status: false, message: "Failed to fetch my documents" };
  }
}

/**
 * Create a new document link
 */
export async function createCustomerDocumentAction(
  customerId: string,
  payload: { name: string; description?: string; fileId: string }
): Promise<{ status: boolean; data?: CustomerDocument; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/${customerId}`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
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

    const result = await res.json();
    return {
      status: true,
      data: result.data || result
    };
  } catch (error) {
    console.error("Failed to create customer document:", error);
    return { status: false, message: "Failed to create customer document" };
  }
}

/**
 * Delete a document
 */
export async function deleteCustomerDocumentAction(id: string): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const url = `${API_BASE}/customer-documents/${id}`;
    
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Host": host,
        "X-Forwarded-Host": host
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: false,
        message: errorData.message || `Error: ${res.status} ${res.statusText}`,
      };
    }

    return { status: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Failed to delete customer document:", error);
    return { status: false, message: "Failed to delete customer document" };
  }
}
