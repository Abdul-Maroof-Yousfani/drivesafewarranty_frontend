import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8080/uploads/:path*",
      },
      {
        source: "/dealer-storage/:path*",
        destination: "http://localhost:8080/dealer-storage/:path*",
      },
      {
        source: "/dealers/:path*",
        destination: "http://localhost:8080/dealers/:path*",
      },
    ];
  },

};

export default nextConfig;
