import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  display_name?: string // 可選
  role: string
}

interface GlobalState {
  // 用戶資料
  user: User | null
  permissions: string[]
  isLoading: boolean

  // 模式管理
  currentMode: 'life' | 'work'

  // 功能開關（從權限計算）
  features: {
    hasWorkMode: boolean
    hasAdminPanel: boolean
    canManageUsers: boolean
    // 業務模組功能開關
    canAccessCustomers: boolean
    canAccessGroups: boolean
    canAccessOrders: boolean
    canAccessInvoices: boolean
    canAccessSuppliers: boolean
  }

  // Actions
  setUser: (user: User | null) => void
  setPermissions: (permissions: string[]) => void
  switchMode: (mode: 'life' | 'work') => void
  clearSession: () => void
  initializeFromAuth: (userId: string) => Promise<void>
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isLoading: true,
      currentMode: 'life',
      features: {
        hasWorkMode: false,
        hasAdminPanel: false,
        canManageUsers: false,
        canAccessCustomers: false,
        canAccessGroups: false,
        canAccessOrders: false,
        canAccessInvoices: false,
        canAccessSuppliers: false,
      },

      setUser: (user) => set({ user }),

      setPermissions: (permissions) => set({
        permissions,
        features: {
          hasWorkMode: permissions.includes('mode.work'),
          hasAdminPanel: permissions.includes('system.admin'),
          canManageUsers: permissions.includes('users.manage'),
          canAccessCustomers: permissions.includes('customers.view'),
          canAccessGroups: permissions.includes('groups.view'),
          canAccessOrders: permissions.includes('orders.view'),
          canAccessInvoices: permissions.includes('invoices.view'),
          canAccessSuppliers: permissions.includes('suppliers.view'),
        }
      }),

      switchMode: (mode) => {
        const { features } = get()
        if (mode === 'work' && !features.hasWorkMode) {
          console.warn('您沒有權限使用工作模式')
          return
        }
        set({ currentMode: mode })
      },

      clearSession: () => set({
        user: null,
        permissions: [],
        currentMode: 'life',
        features: {
          hasWorkMode: false,
          hasAdminPanel: false,
          canManageUsers: false,
          canAccessCustomers: false,
          canAccessGroups: false,
          canAccessOrders: false,
          canAccessInvoices: false,
          canAccessSuppliers: false,
        }
      }),

      initializeFromAuth: async (userId) => {
        const currentState = get()
        set({ isLoading: true })
        try {
          const { supabase } = await import('@/lib/supabase/client')

          // 並行載入 profile 和 permissions
          const [profileResult, permsResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('user_permissions').select('permission').eq('user_id', userId)
          ])

          if (profileResult.data) {
            set({ user: profileResult.data })
          }

          const permissions = permsResult.data?.map(p => p.permission) || []

          // 根據角色加入預設權限
          if (profileResult.data?.role === 'ADMIN') {
            permissions.push('system.admin', 'users.manage', 'mode.work')
          } else if (['STAFF', 'ASSISTANT', 'ACCOUNTANT', 'SALES'].includes(profileResult.data?.role)) {
            permissions.push('mode.work')
          }
          permissions.push('mode.life') // 所有用戶都有生活模式

          get().setPermissions([...new Set(permissions)])

          // 如果用戶有工作模式權限，且當前模式是 work，則保持工作模式
          const hasWorkPermission = permissions.includes('mode.work')
          if (currentState.currentMode === 'work' && !hasWorkPermission) {
            // 如果用戶失去了工作模式權限，切換回生活模式
            set({ currentMode: 'life' })
          }
        } catch (error) {
          console.error('Failed to initialize user data:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'venturo-global-state',
      partialize: (state) => ({
        currentMode: state.currentMode
      }), // 只持久化模式
    }
  )
)

// 確保正確導出
export default useGlobalStore