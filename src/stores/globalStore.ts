import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  display_name?: string
  role: string
}

interface GlobalState {
  user: User | null
  permissions: string[]
  isLoading: boolean
  currentMode: 'life' | 'work'
  features: {
    hasWorkMode: boolean
    hasAdminPanel: boolean
    canManageUsers: boolean
    canAccessCustomers: boolean
    canAccessGroups: boolean
    canAccessOrders: boolean
    canAccessInvoices: boolean
    canAccessSuppliers: boolean
  }
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

          const [profileResult, permsResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('user_permissions').select('permission').eq('user_id', userId)
          ])

          if (profileResult.data) {
            set({ user: profileResult.data })
          }

          const permissions = permsResult.data?.map(p => p.permission) || []

          if (profileResult.data?.role === 'ADMIN') {
            permissions.push('system.admin', 'users.manage', 'mode.work')
          } else if (['STAFF', 'ASSISTANT', 'ACCOUNTANT', 'SALES'].includes(profileResult.data?.role)) {
            permissions.push('mode.work')
          }
          permissions.push('mode.life')

          get().setPermissions([...new Set(permissions)])

          const hasWorkPermission = permissions.includes('mode.work')
          if (currentState.currentMode === 'work' && !hasWorkPermission) {
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
      }),
    }
  )
)