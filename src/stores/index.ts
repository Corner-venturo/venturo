/**
 * VenturoERP Stores 索引檔
 * 統一導出所有 store
 */

// 全域狀態管理
export { useGlobalStore } from './globalStore'

// 業務模組 stores
export { useCustomerStore } from './customerStore'
export { useOrderStore } from './orderStore'
export { useTravelGroupStore } from './travelGroupStore'

// 類型導出
export type { User, GlobalState } from './globalStore'