import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 跳过生产环境的类型检查（避免 Vercel 构建超时）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
