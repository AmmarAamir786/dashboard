import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ⚠️ Warning: This ignores all ESLint errors in builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Warning: This ignores all TypeScript errors in builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
