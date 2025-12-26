"use server";

import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "./constants";

export async function uploadLogoAction(formData: FormData): Promise<{ status: boolean; data?: any; message?: string }> {
    try {
        const token = await getAccessToken();

        // We cannot pass FormData directly to fetch if it's node-fetch or similar in some envs without boundaries,
        // but Next.js Server Actions handle FormData passing well.
        // However, when proxying to another Backend API, we need to reconstruct it or pass it.
        // Since our Backend is Express with Multer, it expects multipart/form-data.

        // In Server Action (Node env), `formData` is available.
        // We forward this to the Backend API.

        const res = await fetch(`${API_BASE}/uploads`, {
            method: "POST",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                // NOT setting Content-Type header so browser/fetch sets boundary automatically for FormData
            },
            body: formData,
            cache: "no-store",
        });

        const json = await res.json();
        return json;
    } catch (error) {
        console.error("Upload failed:", error);
        return { status: false, message: "Upload failed" };
    }
}
