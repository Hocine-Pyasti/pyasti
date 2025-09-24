import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

const nextConfig: NextConfig = withNextIntl()({
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during production builds
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during builds (optional, for `any` issues)
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
    ],
  },
});

export default nextConfig;
