"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/actions/constants";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  permissions: string[];
  mustChangePassword?: boolean;
  phone?: string;
  avatar?: string | null;
  details?: any; // Role specific details (Dealer | Customer)
}

export interface AuthResponse {
  status: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// Login action
export async function login(
  formData: FormData
): Promise<{ status: boolean; message: string; role?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { status: false, message: "Email and password are required" };
  }

  try {
    const res = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await res.json();

    if (data.status && data.data) {
      const cookieStore = await cookies();

      // Set HTTP-only cookies for tokens
      cookieStore.set("accessToken", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60, // 2 hours (matches JWT expiry)
        path: "/",
      });

      cookieStore.set("refreshToken", data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days session
        path: "/",
      });

      // Set user info (non-sensitive) for client access
      cookieStore.set("userRole", data.data.user.role || "user", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Store mustChangePassword flag if present
      if (data.data.user.mustChangePassword) {
        cookieStore.set("mustChangePassword", "true", {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 24 * 60 * 60, // 24 hours
          path: "/",
        });
      }

      cookieStore.set(
        "user",
        JSON.stringify({
          id: data.data.user.id,
          email: data.data.user.email,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          role: data.data.user.role,
          permissions: data.data.user.permissions,
          avatar: data.data.user.avatar,
          details: data.data.user.details,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        }
      );

      return {
        status: true,
        message: "Login successful",
        role: data.data.user.role || undefined,
      };
    }

    return { status: false, message: data.message || "Login failed" };
  } catch (error) {
    console.error("Login error:", error);
    return { status: false, message: "Failed to connect to server" };
  }
}

// Logout action
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    if (accessToken) {
      await fetch(apiUrl("/auth/logout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Clear all auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userRole");
  cookieStore.delete("user");

  redirect("/login");
}

// Get current user from cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

// Get access token
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
}

// Refresh token
export async function refreshAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return false;

  try {
    const res = await fetch(apiUrl("/auth/refresh-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (data.status && data.data) {
      cookieStore.set("accessToken", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60, // 2 hours (matches backend access token expiry)
        path: "/",
      });

      cookieStore.set("refreshToken", data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return true;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
  }

  return false;
}

// Authenticated fetch helper
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  const isFormData = options.body instanceof FormData;

  const makeRequest = async (token: string | undefined) => {
    return fetch(apiUrl(url), {
      ...options,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(accessToken);

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = (await cookies()).get("accessToken")?.value;
      response = await makeRequest(accessToken);
    }
  }

  return response;
}

// Change password
export async function changePassword(
  formData: FormData
): Promise<{ status: boolean; message: string }> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { status: false, message: "All fields are required" };
  }

  try {
    const response = await authFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    return { status: data.status, message: data.message };
  } catch (error) {
    console.error("Change password error:", error);
    return { status: false, message: "Failed to change password" };
  }
}

// Check permission helper
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.permissions.includes(permission);
}

// Check session validity
export async function checkSession(): Promise<{ valid: boolean }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { valid: false };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/check-session`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 401) {
      // Try to refresh
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        // Clear cookies on failed refresh
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        cookieStore.delete("userRole");
        cookieStore.delete("user");
        return { valid: false };
      }
      return { valid: true };
    }

    const data = await res.json();
    return { valid: data.status && data.valid };
  } catch (error) {
    console.error("Session check error:", error);
    return { valid: false };
  }
}

// Get current user profile from server
export async function getMe(): Promise<{
  status: boolean;
  data?: any;
  message?: string;
}> {
  try {
    const response = await authFetch("/auth/me");
    return await response.json();
  } catch (error) {
    console.error("Get me error:", error);
    return { status: false, message: "Failed to get user profile" };
  }
}

// Update current user profile
export async function updateMe(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}): Promise<{ status: boolean; message: string; data?: any }> {
  try {
    const response = await authFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (result.status && result.data) {
      const cookieStore = await cookies();
      const existingUser = JSON.parse(cookieStore.get("user")?.value || "{}");
      cookieStore.set(
        "user",
        JSON.stringify({
          ...existingUser,
          firstName: result.data.firstName || existingUser.firstName,
          lastName: result.data.lastName || existingUser.lastName,
          avatar:
            result.data.avatar !== undefined
              ? result.data.avatar
              : existingUser.avatar,
          details: result.data.details || existingUser.details,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        }
      );
    }

    return result;
  } catch (error) {
    console.error("Update me error:", error);
    return { status: false, message: "Failed to update profile" };
  }
}

// Upload logo/avatar
export async function uploadLogo(
  file: File
): Promise<{ status: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "logo");

    const response = await authFetch("/uploads", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.status && result.data) {
      return { status: true, url: result.data.url };
    }
    return { status: false, message: result.message || "Upload failed" };
  } catch (error) {
    console.error("Upload logo error:", error);
    return { status: false, message: "Failed to upload logo" };
  }
}
