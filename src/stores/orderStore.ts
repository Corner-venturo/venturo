/**
 * VenturoERP 2.0 訂單管理 Zustand Store
 * 負責訂單資料的狀態管理
 */

import { create } from 'zustand'
import { Order, OrderQueryParams, OrderStats, OrderStatus, PaymentStatus } from '@/types/order'
import { orderAPI } from '@/lib/api/order'

interface OrderStore {
  // 狀態
  orders: Order[]
  currentOrder: Order | null
  stats: OrderStats | null
  isLoading: boolean
  error: string | null

  // 查詢參數
  queryParams: OrderQueryParams
  selectedIds: string[]

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQueryParams: (params: OrderQueryParams) => void
  setSelectedIds: (ids: string[]) => void

  // API Actions
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: string) => Promise<void>
  createOrder: (data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateOrder: (id: string, data: Partial<Order>) => Promise<boolean>
  deleteOrder: (id: string) => Promise<boolean>
  deleteSelectedOrders: () => Promise<boolean>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus, paidAmount?: number) => Promise<boolean>
  fetchStats: () => Promise<void>
  searchOrders: (searchTerm: string) => Promise<void>
  filterByStatus: (status?: OrderStatus) => Promise<void>
  filterByPaymentStatus: (paymentStatus?: PaymentStatus) => Promise<void>
  filterByCustomer: (customerId?: string) => Promise<void>
  filterBySalesPerson: (salesPerson?: string) => Promise<void>
  filterByDateRange: (startDate?: string, endDate?: string, dateType?: 'order' | 'departure') => Promise<void>

  // 輔助方法
  clearCurrentOrder: () => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: () => void
  resetFilters: () => void
  calculateOrderTotal: (order: Partial<Order>) => number
  calculateRemainingAmount: (finalAmount: number, paidAmount: number) => number
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // 初始狀態
  orders: [],
  currentOrder: null,
  stats: null,
  isLoading: false,
  error: null,
  queryParams: {
    limit: 50,
    offset: 0,
    sortBy: 'order_date',
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
  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.getAll(get().queryParams)
      if (response.success) {
        set({ orders: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入訂單資料失敗', isLoading: false })
      }
    } catch (error) {
      set({ error: '載入訂單資料時發生錯誤', isLoading: false })
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.getById(id)
      if (response.success) {
        set({ currentOrder: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入訂單資料失敗', isLoading: false })
      }
    } catch (error) {
      set({ error: '載入訂單資料時發生錯誤', isLoading: false })
    }
  },

  createOrder: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.create(data)
      if (response.success) {
        await get().fetchOrders()
        await get().fetchStats()
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '新增訂單失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '新增訂單時發生錯誤', isLoading: false })
      return false
    }
  },

  updateOrder: async (id: string, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.update(id, data)
      if (response.success) {
        await get().fetchOrders()
        if (get().currentOrder?.id === id) {
          set({ currentOrder: response.data })
        }
        await get().fetchStats()
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新訂單失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '更新訂單時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteOrder: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.delete(id)
      if (response.success) {
        await get().fetchOrders()
        await get().fetchStats()
        if (get().currentOrder?.id === id) {
          set({ currentOrder: null })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '刪除訂單失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '刪除訂單時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteSelectedOrders: async () => {
    const { selectedIds } = get()
    if (selectedIds.length === 0) return false

    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.deleteMany(selectedIds)
      if (response.success) {
        await get().fetchOrders()
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

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.updateStatus(id, status)
      if (response.success) {
        await get().fetchOrders()
        await get().fetchStats()
        if (get().currentOrder?.id === id) {
          set({ currentOrder: response.data })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新訂單狀態失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '更新訂單狀態時發生錯誤', isLoading: false })
      return false
    }
  },

  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus, paidAmount?: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await orderAPI.updatePaymentStatus(id, paymentStatus, paidAmount)
      if (response.success) {
        await get().fetchOrders()
        await get().fetchStats()
        if (get().currentOrder?.id === id) {
          set({ currentOrder: response.data })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新付款狀態失敗', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: '更新付款狀態時發生錯誤', isLoading: false })
      return false
    }
  },

  fetchStats: async () => {
    try {
      const response = await orderAPI.getStats()
      if (response.success) {
        set({ stats: response.data })
      }
    } catch (error) {
      console.warn('載入統計資料失敗:', error)
    }
  },

  searchOrders: async (searchTerm: string) => {
    const newParams = {
      ...get().queryParams,
      search: searchTerm || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  filterByStatus: async (status?: OrderStatus) => {
    const newParams = {
      ...get().queryParams,
      status: status || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  filterByPaymentStatus: async (paymentStatus?: PaymentStatus) => {
    const newParams = {
      ...get().queryParams,
      payment_status: paymentStatus || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  filterByCustomer: async (customerId?: string) => {
    const newParams = {
      ...get().queryParams,
      customer_id: customerId || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  filterBySalesPerson: async (salesPerson?: string) => {
    const newParams = {
      ...get().queryParams,
      sales_person: salesPerson || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  filterByDateRange: async (startDate?: string, endDate?: string, dateType: 'order' | 'departure' = 'order') => {
    const newParams = { ...get().queryParams, offset: 0 }

    if (dateType === 'order') {
      newParams.order_date_from = startDate || undefined
      newParams.order_date_to = endDate || undefined
      // 清除出發日期篩選
      newParams.departure_date_from = undefined
      newParams.departure_date_to = undefined
    } else {
      newParams.departure_date_from = startDate || undefined
      newParams.departure_date_to = endDate || undefined
      // 清除訂單日期篩選
      newParams.order_date_from = undefined
      newParams.order_date_to = undefined
    }

    set({ queryParams: newParams })
    await get().fetchOrders()
  },

  // 輔助方法
  clearCurrentOrder: () => set({ currentOrder: null }),
  clearSelection: () => set({ selectedIds: [] }),

  toggleSelection: (id: string) => {
    const { selectedIds } = get()
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id]
    set({ selectedIds: newIds })
  },

  selectAll: () => {
    const { orders } = get()
    set({ selectedIds: orders.map(order => order.id) })
  },

  resetFilters: () => {
    set({
      queryParams: {
        limit: 50,
        offset: 0,
        sortBy: 'order_date',
        sortOrder: 'desc',
        is_active: true
      }
    })
    get().fetchOrders()
  },

  calculateOrderTotal: (order: Partial<Order>) => {
    const total = order.total_amount || 0
    const discount = order.discount_amount || 0
    const tax = order.tax_amount || 0
    return total - discount + tax
  },

  calculateRemainingAmount: (finalAmount: number, paidAmount: number) => {
    return Math.max(0, finalAmount - paidAmount)
  }
}))

// 初始化 Store
export const initializeOrderStore = () => {
  const store = useOrderStore.getState()
  store.fetchOrders()
  store.fetchStats()
}