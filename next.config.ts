import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "s.mxmcdn.net",
      },
      {
        protocol: "https",
        hostname: "s.mxmcdn.net",
      },
    ],
  },
};

export default nextConfig;
