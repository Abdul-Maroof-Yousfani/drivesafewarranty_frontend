"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE, apiUrl } from "@/lib/actions/constants";

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

// export interface AuthResponse {
//   status: boolean;
//   message: string;
//   data?: {
//     user: User;
//     accessToken: string;
//     refreshToken: string;
//   };
// }

// Login action
export async function login(
  formData: FormData
): Promise<{ status: boolean; message: string; role?: string }> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { status: false, message: "Email and password are required" };
    }

    const url = apiUrl("/auth/login");
    console.log(`[Auth] Attempting login to: ${url}`);

    // Pass the Host header so backend knows which subdomain the user is on
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: host, // Forward the original host (e.g. dealer.localhost:3000)
        "X-Forwarded-Host": host, // Extra robustness
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`[Auth] Login response status: ${res.status}`);

    let resData: any;
    try {
      resData = await res.json();
    } catch (e) {
      console.error("[Auth] Failed to parse JSON response");
      return { status: false, message: "Invalid server response" };
    }

    if (!res.ok) {
      console.error("[Auth] Login failed with data:", resData);
      const errorMsg =
        resData.message ||
        resData.error ||
        `Login failed with status ${res.status}`;
      return { status: false, message: errorMsg };
    }

    // Handle nested data structure { status: true, data: { ... } } or flat { ... }
    const data = resData.data || resData;

    console.log("[Auth] Login successful, setting cookies...");

    if (data && data.accessToken) {
      const cookieStore = await cookies();

      // Set HTTP-only cookies for tokens
      try {
        cookieStore.set("accessToken", data.accessToken, {
          httpOnly: true,
          secure: false, // process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 2 * 60 * 60, // 2 hours
          path: "/",
        });

        if (data.refreshToken) {
          cookieStore.set("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
          });
        }

        // User Role
        const role = data.user?.role || data.role || "user";
        cookieStore.set("userRole", role, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        // Must Change Password
        if (data.user?.mustChangePassword) {
          cookieStore.set("mustChangePassword", "true", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
            path: "/",
          });
        }

        // User Info
        if (data.user) {
          cookieStore.set(
            "user",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role,
              permissions: data.user.permissions,
              avatar: data.user.avatar,
              details: data.user.details,
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
      } catch (cookieError) {
        console.error("[Auth] Cookie setting failed:", cookieError);
        // Don't fail the login if possible, but state might be inconsistent
      }

      return {
        status: true,
        message: "Login successful",
        role: data.user?.role || "user",
      };
    }

    return {
      status: false,
      message: "Login failed: Missing token in response",
    };
  } catch (error) {
    console.error("[Auth] Login server action critical error:", error);
    return {
      status: false,
      message: "An unexpected error occurred during login",
    };
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
  cookieStore.delete("mustChangePassword");

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
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(apiUrl("/auth/refresh-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: host,
        "X-Forwarded-Host": host,
      },
      body: JSON.stringify({ refreshToken }),
    });

    const resData = await res.json();
    const data = resData.data || resData;

    if (res.ok && data.accessToken) {
      cookieStore.set("accessToken", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60, // 2 hours (matches backend access token expiry)
        path: "/",
      });

      cookieStore.set("refreshToken", data.refreshToken, {
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
    // Inject Host header so backend validation passes
    const headersList = await headers();
    const host = headersList.get("host") || "";

    return fetch(apiUrl(url), {
      ...options,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Host: host,
        "X-Forwarded-Host": host,
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

    // If password change was successful, remove the mustChangePassword cookie
    if (data.status) {
      const cookieStore = await cookies();
      cookieStore.delete("mustChangePassword");
    }

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
    console.log(`[Auth] Checking session at ${API_BASE}/auth/me`);

    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Host: host,
        "X-Forwarded-Host": host,
      },
    });

    console.log(`[Auth] Session check status: ${res.status}`);

    if (res.status === 401) {
      console.log(
        "[Auth] Session expired/invalid (401 from backend). Attempting refresh..."
      );
      // Try to refresh using frontend logic if backend didn't handle it
      // BUT if backend handled it (seamless refresh), status would be 200.
      // So if we get 401 here, it means backend REJECTED it (refresh failed or no refresh token).

      // Attempt explicit refresh as fallback
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        console.log("[Auth] Explicit refresh failed, clearing cookies");
        // Clear cookies on failed refresh
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        cookieStore.delete("userRole");
        cookieStore.delete("user");
        cookieStore.delete("mustChangePassword");
        return { valid: false };
      }
      console.log("[Auth] Explicit refresh successful");
      return { valid: true };
    }

    // Check for seamless refresh headers from backend
    const newAccessToken = res.headers.get("x-new-access-token");
    const newRefreshToken = res.headers.get("x-new-refresh-token");

    if (newAccessToken) {
      console.log(
        "[Auth] Received new tokens from backend seamless refresh. Updating cookies."
      );
      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60, // 2 hours
        path: "/",
      });

      if (newRefreshToken) {
        cookieStore.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });
      }
    }

    if (!res.ok) {
      console.error(`[Auth] Session check failed with status ${res.status}`);

      // If server error, assume session is still valid to prevent annoying popups
      // The next user action will fail if the server is really down, but we shouldn't
      // forcefully log them out via the background checker.
      if (res.status >= 500) {
        return { valid: true };
      }
    }

    return { valid: res.ok };
  } catch (error) {
    console.error("Session check error:", error);
    // On network error or other exceptions, don't force logout
    return { valid: true };
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

    if (response.ok && result) {
      const cookieStore = await cookies();
      const existingUser = JSON.parse(cookieStore.get("user")?.value || "{}");
      cookieStore.set(
        "user",
        JSON.stringify({
          ...existingUser,
          firstName: result.firstName || existingUser.firstName,
          lastName: result.lastName || existingUser.lastName,
          avatar:
            result.avatar !== undefined ? result.avatar : existingUser.avatar,
          details: result.details || existingUser.details,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        }
      );
      return {
        status: true,
        message: "Profile updated successfully",
        data: result,
      };
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

    const response = await authFetch("/upload/single?category=logos", {
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
