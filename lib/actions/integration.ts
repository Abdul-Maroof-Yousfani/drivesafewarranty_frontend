"use server";

import { authFetch } from "@/lib/auth";

export async function getHrmSsoUrlAction(): Promise<{ status: boolean; url?: string; message?: string }> {
  try {
    const response = await authFetch("/integration/hrm/sso-url");
    const result = await response.json();

    // Check for nested data object (standard interceptor response)
    const url = result.data?.url || result.url;

    if (response.ok && url) {
      return { status: true, url };
    }
    
    return { 
        status: false, 
        message: result.message || `Failed to generate SSO URL: ${response.status}` 
    };
  } catch (error) {
    console.error("SSO URL generation error:", error);
    return { status: false, message: "Failed to connect to authentication server" };
  }
}
 