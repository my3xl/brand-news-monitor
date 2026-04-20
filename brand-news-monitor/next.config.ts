import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用 Turbopack（使用 Webpack）
  turbo: {
    enabled: false,
  },
};

export default nextConfig;
