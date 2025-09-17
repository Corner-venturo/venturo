/**
 * VenturoERP 2.0 旅遊團管理 Zustand Store
 * 負責旅遊團資料的狀態管理
 */

import { create } from 'zustand'
import { TravelGroup, TravelGroupQueryParams, TravelGroupStats, TravelGroupStatus } from '@/types/travelGroup'
import { travelGroupAPI } from '@/lib/api/travelGroup'

interface TravelGroupStore {
  // 狀態
  travelGroups: TravelGroup[]
  currentTravelGroup: TravelGroup | null
  stats: TravelGroupStats | null
  isLoading: boolean
  error: string | null

  // 查詢參數
  queryParams: TravelGroupQueryParams
  selectedIds: string[]

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQueryParams: (params: TravelGroupQueryParams) => void
  setSelectedIds: (ids: string[]) => void

  // API Actions
  fetchTravelGroups: () => Promise<void>
  fetchTravelGroupById: (id: string) => Promise<void>
  createTravelGroup: (data: Omit<TravelGroup, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateTravelGroup: (id: string, data: Partial<TravelGroup>) => Promise<boolean>
  deleteTravelGroup: (id: string) => Promise<boolean>
  deleteSelectedTravelGroups: () => Promise<boolean>
  updateTravelGroupStatus: (id: string, status: TravelGroupStatus) => Promise<boolean>
  fetchStats: () => Promise<void>
  searchTravelGroups: (searchTerm: string) => Promise<void>
  filterByStatus: (status?: TravelGroupStatus) => Promise<void>
  filterByDestination: (destination: string) => Promise<void>
  filterByDateRange: (startDate?: string, endDate?: string) => Promise<void>

  // 輔助方法
  clearCurrentTravelGroup: () => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: () => void
  resetFilters: () => void
}

export const useTravelGroupStore = create<TravelGroupStore>((set, get) => ({
  // 初始狀態
  travelGroups: [],
  currentTravelGroup: null,
  stats: null,
  isLoading: false,
  error: null,
  queryParams: {
    limit: 50,
    offset: 0,
    sortBy: 'departure_date',
    sortOrder: 'asc',
    is_active: true
  },
  selectedIds: [],

  // 基礎 Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setQueryParams: (params) => set({ queryParams: { ...get().queryParams, ...params } }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  // API Actions
  fetchTravelGroups: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.getAll(get().queryParams)
      if (response.success) {
        set({ travelGroups: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入旅遊團資料失敗', isLoading: false })
      }
    } catch (_error) {
      set({ error: '載入旅遊團資料時發生錯誤', isLoading: false })
    }
  },

  fetchTravelGroupById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.getById(id)
      if (response.success) {
        set({ currentTravelGroup: response.data, isLoading: false })
      } else {
        set({ error: response.error || '載入旅遊團資料失敗', isLoading: false })
      }
    } catch (_error) {
      set({ error: '載入旅遊團資料時發生錯誤', isLoading: false })
    }
  },

  createTravelGroup: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.create(data)
      if (response.success) {
        await get().fetchTravelGroups()
        await get().fetchStats()
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '新增旅遊團失敗', isLoading: false })
        return false
      }
    } catch (_error) {
      set({ error: '新增旅遊團時發生錯誤', isLoading: false })
      return false
    }
  },

  updateTravelGroup: async (id: string, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.update(id, data)
      if (response.success) {
        await get().fetchTravelGroups()
        if (get().currentTravelGroup?.id === id) {
          set({ currentTravelGroup: response.data })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新旅遊團失敗', isLoading: false })
        return false
      }
    } catch (_error) {
      set({ error: '更新旅遊團時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteTravelGroup: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.delete(id)
      if (response.success) {
        await get().fetchTravelGroups()
        await get().fetchStats()
        if (get().currentTravelGroup?.id === id) {
          set({ currentTravelGroup: null })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '刪除旅遊團失敗', isLoading: false })
        return false
      }
    } catch (_error) {
      set({ error: '刪除旅遊團時發生錯誤', isLoading: false })
      return false
    }
  },

  deleteSelectedTravelGroups: async () => {
    const { selectedIds } = get()
    if (selectedIds.length === 0) return false

    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.deleteMany(selectedIds)
      if (response.success) {
        await get().fetchTravelGroups()
        await get().fetchStats()
        set({ selectedIds: [], isLoading: false })
        return true
      } else {
        set({ error: response.error || '批量刪除失敗', isLoading: false })
        return false
      }
    } catch (_error) {
      set({ error: '批量刪除時發生錯誤', isLoading: false })
      return false
    }
  },

  updateTravelGroupStatus: async (id: string, status: TravelGroupStatus) => {
    set({ isLoading: true, error: null })
    try {
      const response = await travelGroupAPI.updateStatus(id, status)
      if (response.success) {
        await get().fetchTravelGroups()
        await get().fetchStats()
        if (get().currentTravelGroup?.id === id) {
          set({ currentTravelGroup: response.data })
        }
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.error || '更新狀態失敗', isLoading: false })
        return false
      }
    } catch (_error) {
      set({ error: '更新狀態時發生錯誤', isLoading: false })
      return false
    }
  },

  fetchStats: async () => {
    try {
      const response = await travelGroupAPI.getStats()
      if (response.success) {
        set({ stats: response.data })
      }
    } catch (_error) {
      console.warn('載入統計資料失敗:', error)
    }
  },

  searchTravelGroups: async (searchTerm: string) => {
    const newParams = {
      ...get().queryParams,
      search: searchTerm || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchTravelGroups()
  },

  filterByStatus: async (status?: TravelGroupStatus) => {
    const newParams = {
      ...get().queryParams,
      status: status || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchTravelGroups()
  },

  filterByDestination: async (destination: string) => {
    const newParams = {
      ...get().queryParams,
      destination: destination || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchTravelGroups()
  },

  filterByDateRange: async (startDate?: string, endDate?: string) => {
    const newParams = {
      ...get().queryParams,
      departure_date_from: startDate || undefined,
      departure_date_to: endDate || undefined,
      offset: 0
    }
    set({ queryParams: newParams })
    await get().fetchTravelGroups()
  },

  // 輔助方法
  clearCurrentTravelGroup: () => set({ currentTravelGroup: null }),
  clearSelection: () => set({ selectedIds: [] }),

  toggleSelection: (id: string) => {
    const { selectedIds } = get()
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id]
    set({ selectedIds: newIds })
  },

  selectAll: () => {
    const { travelGroups } = get()
    set({ selectedIds: travelGroups.map(group => group.id) })
  },

  resetFilters: () => {
    set({
      queryParams: {
        limit: 50,
        offset: 0,
        sortBy: 'departure_date',
        sortOrder: 'asc',
        is_active: true
      }
    })
    get().fetchTravelGroups()
  }
}))

// 初始化 Store
export const initializeTravelGroupStore = () => {
  const store = useTravelGroupStore.getState()
  store.fetchTravelGroups()
  store.fetchStats()
}