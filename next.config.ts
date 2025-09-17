import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 正確設定路徑別名解析
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 移除 ignoreBuildErrors - 我們要修復問題，不是忽略它
};

export default nextConfig;
