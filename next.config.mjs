import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 配置
  typescript: {
    // 暫時忽略構建錯誤
    ignoreBuildErrors: true,
  },
  
  // 實驗性功能
  experimental: {
    // 優化套件導入
    optimizePackageImports: ['@headlessui/react', 'lucide-react', 'zustand'],
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 修正路徑解析
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }
    
    // 處理可能的模組問題
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // 環境變數
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // 靜態導出設定
  output: 'standalone',
}

export default nextConfig
