"use server";

import { getAccessToken } from "@/lib/auth";

const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export async function getInvoiceSettingsAction(): Promise<{
    status: boolean;
    data?: any;
    message?: string;
}> {
    try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE}/settings`, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            cache: "no-store",
        });
        return res.json();
    } catch (error) {
        console.error("Failed to fetch invoice settings:", error);
        return { status: false, message: "Failed to fetch invoice settings" };
    }
}

export async function saveInvoiceSettingsAction(
    payload: any
): Promise<{ status: boolean; data?: any; message?: string }> {
    try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE}/settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(payload),
        });
        return res.json();
    } catch (error) {
        console.error("Failed to save invoice settings:", error);
        return { status: false, message: "Failed to save invoice settings" };
    }
}
