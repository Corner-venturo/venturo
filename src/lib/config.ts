/**
 * 應用程式配置設定
 * 控制 mock 資料模式和其他環境設定
 */

// 環境變數控制 mock 模式
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development'

// API 配置
export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  mockDelay: 500, // mock API 延遲時間 (毫秒)
  enableLogging: process.env.NODE_ENV === 'development',
}

// Mock 資料生成配置
export const MOCK_CONFIG = {
  groupsCount: 20,
  receiptsCount: 50,
  invoicesCount: 50,
  customersCount: 30,
  ordersCount: 100,
}