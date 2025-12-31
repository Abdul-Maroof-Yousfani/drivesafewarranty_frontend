"use server";

import { getAccessToken } from "@/lib/auth";

import { API_BASE } from "./constants";

export async function getInvoiceSettingsAction(dealerId?: string, scope?: string): Promise<{
    status: boolean;
    data?: any;
    message?: string;
}> {
    try {
        const token = await getAccessToken();
        const url = new URL(`${API_BASE}/settings`);
        if (dealerId) {
            url.searchParams.append("dealerId", dealerId);
        }
        if (scope) {
            url.searchParams.append("scope", scope);
        }

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return { status: false, message: `Error: ${res.status} ${res.statusText}` };
        }

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

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            const message = errorBody.message || `Error: ${res.status} ${res.statusText}`;
            return { status: false, message };
        }

        return res.json();
    } catch (error) {
        console.error("Failed to save invoice settings:", error);
        return { status: false, message: "Failed to save invoice settings" };
    }
}
