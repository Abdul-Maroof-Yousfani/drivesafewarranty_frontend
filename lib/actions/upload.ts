"use server";

import { headers } from "next/headers";

import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export async function uploadLogoAction(
  formData: FormData
): Promise<{ status: boolean; data?: any; message?: string }> {
  try {
    const token = await getAccessToken();

    // We cannot pass FormData directly to fetch if it's node-fetch or similar in some envs without boundaries,
    // but Next.js Server Actions handle FormData passing well.
    // However, when proxying to another Backend API, we need to reconstruct it or pass it.
    // Since our Backend is Express with Multer, it expects multipart/form-data.

    // In Server Action (Node env), `formData` is available.
    // We forward this to the Backend API.

    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/upload/single?category=logos`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Host: host,
        "X-Forwarded-Host": host,
        // NOT setting Content-Type header so browser/fetch sets boundary automatically for FormData
      },
      body: formData,
      cache: "no-store",
    });

    // Check if response is OK before parsing JSON
    if (!res.ok) {
      let errorMessage = `Upload failed: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default error message
      }
      console.error("Upload failed:", errorMessage);
      return { status: false, message: errorMessage };
    }

    const json = await res.json();

    // Check if the response has status field
    if (!json.status) {
      console.error("Upload failed:", json.message || "Unknown error");
      return { status: false, message: json.message || "Upload failed" };
    }

    const rawUrl = json.data?.url as string | undefined;
    const normalizedUrl = rawUrl
      ? /^https?:\/\//i.test(rawUrl)
        ? (() => {
            try {
              const u = new URL(rawUrl);
              u.pathname = u.pathname.replace(
                /^\/api(?=\/(uploads|dealer-storage|dealers|master)(\/|$))/,
                ""
              );
              return u.toString();
            } catch {
              return rawUrl;
            }
          })()
        : rawUrl.startsWith("/")
        ? rawUrl
        : `/${rawUrl}`
      : rawUrl;

    return {
      ...json,
      data: {
        ...json.data,
        url: normalizedUrl,
      },
    };
  } catch (error) {
    console.error("Upload failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return { status: false, message: errorMessage };
  }
}
