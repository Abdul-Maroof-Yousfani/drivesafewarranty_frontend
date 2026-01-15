import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },

  // Experimental features
  experimental: {
    // Increase server action body size limit for file uploads
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  async rewrites() {
    // Extract base URL without /api suffix for static file serving
    const backendBaseUrl = backendUrl?.replace(/\/api\/?$/, "");

    return [
      {
        source: "/uploads/:path*",
        destination: `${backendBaseUrl}/uploads/:path*`,
      },
      {
        source: "/dealer-storage/:path*",
        destination: `${backendBaseUrl}/dealer-storage/:path*`,
      },
      {
        source: "/dealers/:path*",
        destination: `${backendBaseUrl}/dealers/:path*`,
      },
      {
        source: "/master/:path*",
        destination: `${backendBaseUrl}/master/:path*`,
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
