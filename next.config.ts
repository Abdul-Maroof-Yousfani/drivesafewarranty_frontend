import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    // Extract base URL without /api suffix for static file serving
    const backendBaseUrl = backendUrl?.replace(/\/api\/?$/, "") ;
    

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
    ];
  },
};

export default nextConfig;
