
import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/dealer-storage/:path*",
        destination: `${backendUrl}/dealer-storage/:path*`,
      },
      {
        source: "/dealers/:path*",
        destination: `${backendUrl}/dealers/:path*`,
      },
    ];
  },
};

export default nextConfig;
