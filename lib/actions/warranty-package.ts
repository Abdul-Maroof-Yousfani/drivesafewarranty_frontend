"use server";

import { cookies } from "next/headers";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export interface WarrantyPackage {
  id: string;
  name: string;
  description?: string | null;
  planLevel?: string | null;
  eligibility?: string | null;
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
  includedFeatures?: string[] | null;
  keyBenefits?: string[] | null;
  coverageDuration?: number;
  durationValue?: number;
  durationUnit?: "months" | "years";
  context: "drive_safe" | "dealer" | "direct_customer";
  price?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export async function getWarrantyItemsAction(): Promise<
  ApiResponse<{ id: string; label: string; type: string; status: string }[]>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) {
    return { status: false, message: "Not authenticated" };
  }
  try {
    const res = await fetch(`${API_BASE}/warranty-items`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    return { status: false, message: "Failed to load warranty items" };
  }
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
    const res = await fetch(`${API_BASE}/warranty-packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

export async function getWarrantyPackagesAction(): Promise<
  ApiResponse<WarrantyPackage[]>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { status: false, message: "Not authenticated" };
  }

  const res = await fetch(`${API_BASE}/warranty-packages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
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

  // Use the dealer-specific endpoint to ensure filtering
  const res = await fetch(`${API_BASE}/dealer/warranty-packages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
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
    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

  const res = await fetch(`${API_BASE}/warranty-packages/assign-to-dealer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  const json = await res.json();
  return json;
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
    const res = await fetch(`${API_BASE}/warranty-packages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
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
    const res = await fetch(`${API_BASE}/dealer/warranty-packages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
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
