"use server";

import { headers } from "next/headers";
import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export interface DealerDocument {
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
  dealerId: string;
  uploadedById: string | null;
  uploadedBy: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  dealer?: {
    id: string;
    businessNameLegal: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Get my dealer documents (Dealer portal)
 */
export async function getMyDealerDocumentsAction(): Promise<{ status: boolean; data?: DealerDocument[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer-documents/mine`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { status: false, message: errorData.message || `Error: ${res.status}` };
    }

    const result = await res.json();
    return { status: true, data: result.data || result };
  } catch (error) {
    console.error("Failed to fetch dealer documents:", error);
    return { status: false, message: "Failed to fetch dealer documents" };
  }
}

/**
 * Get all dealer documents across all dealers (Super Admin)
 */
export async function getAllDealerDocumentsAction(): Promise<{ status: boolean; data?: DealerDocument[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer-documents/all`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { status: false, message: errorData.message || `Error: ${res.status}` };
    }

    const result = await res.json();
    return { status: true, data: result.data || result };
  } catch (error) {
    console.error("Failed to fetch all dealer documents:", error);
    return { status: false, message: "Failed to fetch all dealer documents" };
  }
}

/**
 * Get documents for a specific dealer (Super Admin)
 */
export async function getDealerDocumentsByIdAction(dealerId: string): Promise<{ status: boolean; data?: DealerDocument[]; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer-documents/${dealerId}`, {
      cache: "no-store",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { status: false, message: errorData.message || `Error: ${res.status}` };
    }

    const result = await res.json();
    return { status: true, data: result.data || result };
  } catch (error) {
    console.error("Failed to fetch dealer documents:", error);
    return { status: false, message: "Failed to fetch dealer documents" };
  }
}

/**
 * Create a dealer document
 */
export async function createDealerDocumentAction(
  dealerId: string,
  payload: { name: string; description?: string; fileId: string }
): Promise<{ status: boolean; data?: DealerDocument; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer-documents/${dealerId}`, {
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
      return { status: false, message: errorData.message || `Error: ${res.status}` };
    }

    const result = await res.json();
    return { status: true, data: result.data || result };
  } catch (error) {
    console.error("Failed to create dealer document:", error);
    return { status: false, message: "Failed to create dealer document" };
  }
}

/**
 * Delete a dealer document
 */
export async function deleteDealerDocumentAction(id: string): Promise<{ status: boolean; message?: string }> {
  try {
    const token = await getAccessToken();
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer-documents/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { status: false, message: errorData.message || `Error: ${res.status}` };
    }

    return { status: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Failed to delete dealer document:", error);
    return { status: false, message: "Failed to delete dealer document" };
  }
}
