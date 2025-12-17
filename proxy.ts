import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login"];

// Routes that require authentication (any role)
const protectedRoutes = ["/super-admin", "/dealer", "/customer", "/dashboard"];

// Helper: get role-specific default dashboard
function getDashboardPath(role: string | undefined | null): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/super-admin/dashboard";
    case "dealer":
      return "/dealer/dashboard";
    case "customer":
      return "/customer/dashboard";
    default:
      return "/login";
  }
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Get tokens and role from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isAuthenticated = !!accessToken;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from public routes (e.g. /login)
  if (isAuthenticated && isPublicRoute) {
    const target = getDashboardPath(userRole);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection for authenticated users
  if (isAuthenticated) {
    const role = userRole;

    // Super Admin / Admin only areas
    const isSuperAdminRoute =
      pathname.startsWith("/super-admin") ||
      pathname.startsWith("/dashboard/admin");
    if (
      isSuperAdminRoute &&
      role !== "super_admin" &&
      role !== "admin"
    ) {
      const target = getDashboardPath(role);
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Dealer-only routes
    const isDealerRoute = pathname.startsWith("/dealer");
    if (isDealerRoute && role !== "dealer") {
      const target = getDashboardPath(role);
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Customer-only routes
    const isCustomerRoute = pathname.startsWith("/customer");
    if (isCustomerRoute && role !== "customer") {
      const target = getDashboardPath(role);
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};

