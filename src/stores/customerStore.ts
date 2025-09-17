/**
 * VenturoERP 2.0 顧客管理 Zustand Store
 * 負責顧客資料的狀態管理
 */

import { create } from 'zustand'
import { Customer, CustomerQueryParams, CustomerStats } from '@/types/customer'
import { customerAPI } from '@/lib/api/customer'

interface CustomerStore {
  // 狀態
  customers: Customer[]
  currentCustomer: Customer | null
  stats: CustomerStats | null
  isLoading: boolean
  error: string | null

  // 查詢參數
  queryParams: CustomerQueryParams
  selectedIds: string[]

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQueryParams: (params: CustomerQueryParams) => void
  setSelectedIds: (ids: string[]) => void

  // API Actions
  fetchCustomers: () => Promise<void>
  fetchCustomerById: (id: string) => Promise<void>
  createCustomer: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>
  deleteCustomer: (id: string) => Promise<boolean>
  deleteSelectedCustomers: () => Promise<boolean>
  fetchStats: () => Promise<void>
  searchCustomers: (searchTerm: string) => Promise<void>
  exportCustomers: () => Promise<Customer[] | null>

  // 輔助方法
  clearCurrentCustomer: () => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: () => void
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  // 初始狀態
  customers: [],
  currentCustomer: null,
  stats: null,
  isLoading: false,
  error: null,
  queryParams: {
    limit: 50,
    offset: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
    is_active: true
  },
  selectedIds: [],

  // 基礎 Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setQueryParams: (params) => set({ queryParams: { ...get().queryParams, ...params } }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  // API Actions
  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.getAll(get().queryParams)
      if (response.success) {
        set({ customers: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入顧客資料失敗', isLoading: false })
      }
    } catch (error) {
      set({ error: '載入顧客資料時發生錯誤', isLoading: false })
    }
  },

  fetchCustomerById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.getById(id)
      if (response.success) {
        set({ currentCustomer: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入顧客資料失敗', isLoading: false })
      }
    } catch (error) {
      set({ error: '載入顧客資料時發生錯誤', isLoading: false })
    }
  },

  createCustomer: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.create(data)
      if (response.success) {
        await get().fetchCustomers()
        await get().fetchStats()
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '新增顧客失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '新增顧客時發生錯誤', isLoading: false })
      return false
    }
  },

  updateCustomer: async (id: string, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.update(id, data)
      if (response.success) {
        await get().fetchCustomers()
        if (get().currentCustomer?.id === id) {
          set({ currentCustomer: response.data })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新顧客失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '更新顧客時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteCustomer: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.delete(id)
      if (response.success) {
        await get().fetchCustomers()
        await get().fetchStats()
        if (get().currentCustomer?.id === id) {
          set({ currentCustomer: null })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '刪除顧客失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '刪除顧客時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteSelectedCustomers: async () => {
    const { selectedIds } = get()
    if (selectedIds.length === 0) return false

    set({ isLoading: true, error: null })
    try {
      const response = await customerAPI.deleteMany(selectedIds)
      if (response.success) {
        await get().fetchCustomers()
        await get().fetchStats()
        set({ selectedIds: [], isLoading: false })
        return true
      } else {
        set({ error: response.error || '批量刪除失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '批量刪除時發生錯誤', isLoading: false })
      return false
    }
  },

  fetchStats: async () => {
    try {
      const response = await customerAPI.getStats()
      if (response.success) {
        set({ stats: response.data })
      }
    } catch (error) {
      console.warn('載入統計資料失敗:', error)
    }
  },

  searchCustomers: async (searchTerm: string) => {
    const newParams = {
      ...get().queryParams,
      search: searchTerm || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchCustomers()
  },

  exportCustomers: async () => {
    try {
      const response = await customerAPI.exportCustomers(get().queryParams)
      if (response.success) {
        return response.data
      } else {
        set({ error: response.error || '匯出資料失敗' })
        return null
      }
    } catch (error) {
      set({ error: '匯出資料時發生錯誤' })
      return null
    }
  },

  // 輔助方法
  clearCurrentCustomer: () => set({ currentCustomer: null }),
  clearSelection: () => set({ selectedIds: [] }),

  toggleSelection: (id: string) => {
    const { selectedIds } = get()
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id]
    set({ selectedIds: newIds })
  },

  selectAll: () => {
    const { customers } = get()
    set({ selectedIds: customers.map(customer => customer.id) })
  }
}))

// 初始化 Store
export const initializeCustomerStore = () => {
  const store = useCustomerStore.getState()
  store.fetchCustomers()
  store.fetchStats()
}