"use server";

import { cookies, headers } from "next/headers";
import { API_BASE } from "./constants";

export interface WarrantyPackage {
  id: string;
  name: string;
  description?: string | null;
  planLevel?: string | null;
  eligibility?: string | null;
  eligibilityMileageComparator?: "gt" | "lt" | null;
  eligibilityMileageValue?: number | null;
  eligibilityVehicleAgeYearsMax?: number | null;
  eligibilityTransmission?: "manual" | "automatic" | null;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  // Dealer internal prices (cost to dealer when SA assigns package)
  dealerPrice12Months?: number | null;
  dealerPrice24Months?: number | null;
  dealerPrice36Months?: number | null;
  items?: Array<{
    id: string;
    type: "benefit" | "feature";
    warrantyItem: {
      id: string;
      label: string;
      description?: string | null;
      type: string;
    };
  }> | null;
  coverageDuration?: number;
  durationValue?: number;
  durationUnit?: "months" | "years";
  context: "drive_safe" | "dealer" | "direct_customer";
  price?: number | null;
  status: string;
  keyBenefits?: string[];
  includedFeatures?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  stats?: {
    activeAssignments: number;
    claimsRatio: number;
  };
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export async function createWarrantyPackageAction(
  payload: Omit<WarrantyPackage, "id" | "status" | "createdAt" | "updatedAt">
): Promise<ApiResponse<WarrantyPackage>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages`, {
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

    if (!res.ok) {
      console.error(
        "Failed to create warranty package:",
        res.status,
        res.statusText
      );
      try {
        const errorData = await res.json();
        // Return the specific message from backend if available
        return {
          status: false,
          message:
            errorData.message ||
            errorData.error ||
            `Failed with status ${res.status}`,
        };
      } catch (e) {
        return {
          status: false,
          message: `Failed with status ${res.status} - ${res.statusText}`,
        };
      }
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Error creating warranty package:", error);
    return { status: false, message: "Network error or server unreachable" };
  }
}

export async function getWarrantyPackagesAction(options?: {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  context?: string;
}): Promise<ApiResponse<WarrantyPackage[]>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  const query = new URLSearchParams();
  if (options?.includeInactive) query.append("includeInactive", "true");
  if (options?.includeDeleted) query.append("includeDeleted", "true");
  if (options?.context) query.append("context", options.context);
  const queryString = query.toString();

  const headersList = await headers();
  const host = headersList.get("host") || "";

  const res = await fetch(`${API_BASE}/warranty-packages${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Host: host,
      "X-Forwarded-Host": host,
    },
    cache: "no-store",
  });

  const json = await res.json();
  return json;
}

export async function getDealerWarrantyPackagesAction(): Promise<
  ApiResponse<WarrantyPackage[]>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  // Dealer access is served via tenant context on the standard endpoint
  const headersList = await headers();
  const host = headersList.get("host") || "";

  const res = await fetch(`${API_BASE}/warranty-packages?context=dealer`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Host: host,
      "X-Forwarded-Host": host,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      status: false,
      message: errorData.message || `Failed with status ${res.status}`,
    };
  }

  const json = await res.json();
  return json;
}

export async function updateDealerPackagePriceAction(
  id: string,
  price: number
): Promise<ApiResponse<WarrantyPackage>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify({ price }),
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: false, message: "Failed to update package price" };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { status: false, message: "Network error" };
  }
}

export async function getWarrantyPackageByIdAction(
  id: string
): Promise<ApiResponse<WarrantyPackage>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: false, message: "Failed to fetch warranty package" };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { status: false, message: "Failed to fetch warranty package" };
  }
}

export async function updateWarrantyPackageAction(
  id: string,
  payload: Partial<
    Omit<
      WarrantyPackage,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "dealerPrice12Months"
      | "dealerPrice24Months"
      | "dealerPrice36Months"
    >
  >
): Promise<ApiResponse<WarrantyPackage>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
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

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        status: false,
        message: err.message || `Failed with status ${res.status}`,
      };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    return { status: false, message: "Network error" };
  }
}


export async function restoreWarrantyPackageAction(
  id: string
): Promise<{ status: boolean; message?: string; data?: WarrantyPackage }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/${id}/restore`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to restore warranty package:", error);
    return { status: false, message: "Failed to restore warranty package" };
  }
}

// Assign an existing warranty package to a dealer (copies into dealer's tenant DB)
export async function assignWarrantyPackageToDealer(params: {
  dealerId: string;
  warrantyPackageId: string;
  duration?: number;
  excess?: number | null;
  labourRatePerHour?: number | null;
  fixedClaimLimit?: number | null;
  // Dealer internal prices (cost to dealer - SA can set these)
  dealerPrice12Months?: number | null;
  dealerPrice24Months?: number | null;
  dealerPrice36Months?: number | null;
}): Promise<
  ApiResponse<{
    masterPackage: WarrantyPackage;
    dealerPackage: WarrantyPackage;
  }>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/assign-to-dealer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify(params),
      cache: "no-store",
    });

    const raw = await res.text();
    const parsed = (() => {
      try {
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();

    if (!res.ok) {
      const message =
        (typeof parsed?.message === "string" && parsed.message) ||
        (Array.isArray(parsed?.message) && parsed.message.join(", ")) ||
        (typeof parsed?.error === "string" && parsed.error) ||
        `Error: ${res.status} ${res.statusText}`;
      return { status: false, message };
    }

    return parsed;
  } catch (error) {
    return { status: false, message: "Network error or server unreachable" };
  }
}

export async function deleteWarrantyPackageAction(
  id: string
): Promise<{ status: boolean; message?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to delete warranty package:", error);
    return { status: false, message: "Failed to delete warranty package" };
  }
}

export async function deleteWarrantyPackages(
  ids: string[]
): Promise<{ status: boolean; message: string }> {
  if (!ids.length) return { status: false, message: "No items to delete" };
  try {
    const results = await Promise.all(
      ids.map((id) => deleteWarrantyPackageAction(id))
    );
    const failed = results.filter((r) => !r.status);
    if (failed.length > 0) {
      return {
        status: false,
        message: `${failed.length} package(s) failed to delete`,
      };
    }
    return {
      status: true,
      message: `${results.length} package(s) deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete warranty packages:", error);
    return { status: false, message: "Failed to delete warranty packages" };
  }
}

export async function deleteDealerWarrantyPackageAction(
  id: string
): Promise<{ status: boolean; message?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/dealer/warranty-packages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
    });
    return res.json();
  } catch (error) {
    console.error("Failed to delete dealer warranty package:", error);
    return { status: false, message: "Failed to delete warranty package" };
  }
}

export async function deleteDealerWarrantyPackages(
  ids: string[]
): Promise<{ status: boolean; message: string }> {
  if (!ids.length) return { status: false, message: "No items to delete" };
  try {
    const results = await Promise.all(
      ids.map((id) => deleteDealerWarrantyPackageAction(id))
    );
    const failed = results.filter((r) => !r.status);
    if (failed.length > 0) {
      return {
        status: false,
        message: `${failed.length} package(s) failed to delete`,
      };
    }
    return {
      status: true,
      message: `${results.length} package(s) deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete dealer warranty packages:", error);
    return { status: false, message: "Failed to delete warranty packages" };
  }
}

/**
 * Get all warranty plan presets
 */