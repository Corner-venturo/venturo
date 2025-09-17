'use client'

import { useGlobalStore } from '@/stores/globalStore'

export type Permission =
  // 基礎權限
  | 'mode.work'
  | 'admin.users'
  | 'admin.settings'
  | 'system.admin'

  // 業務模組權限 - 顧客管理
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  | 'customers.import'

  // 業務模組權限 - 旅遊團管理
  | 'groups.view'
  | 'groups.create'
  | 'groups.update'
  | 'groups.delete'
  | 'groups.manage_bonus'

  // 業務模組權限 - 訂單管理
  | 'orders.view'
  | 'orders.create'
  | 'orders.update'
  | 'orders.delete'

  // 業務模組權限 - 財務管理
  | 'invoices.view'
  | 'invoices.create'
  | 'invoices.update'
  | 'invoices.delete'
  | 'invoices.confirm'
  | 'receipts.view'
  | 'receipts.create'
  | 'receipts.update'
  | 'receipts.delete'

  // 業務模組權限 - 供應商管理
  | 'suppliers.view'
  | 'suppliers.create'
  | 'suppliers.update'
  | 'suppliers.delete'

export const usePermissions = () => {
  const { user, features, isLoading } = useGlobalStore()

  const hasPermission = (permission: string | Permission): boolean => {
    if (!user) return false

    // 基於角色的權限映射 (對應 cornerERP 的角色系統)
    const rolePermissions = {
      'SUPER_ADMIN': 'admin',        // 對應 cornerERP admin
      'CORNER_EMPLOYEE': 'accountant', // 對應 cornerERP accountant
      'FRIEND': 'user'               // 對應 cornerERP user
    }

    const userLevel = rolePermissions[user.role as keyof typeof rolePermissions] || 'user'

    // 階層式權限檢查 (admin > accountant > user)
    const hasRoleAccess = (requiredLevel: string): boolean => {
      const levels = ['user', 'accountant', 'admin']
      const userLevelIndex = levels.indexOf(userLevel)
      const requiredLevelIndex = levels.indexOf(requiredLevel)
      return userLevelIndex >= requiredLevelIndex
    }

    // 權限對應表
    switch (permission) {
      // 基礎權限
      case 'mode.work':
        return features.hasWorkMode
      case 'admin.users':
      case 'admin.settings':
        return features.canManageUsers
      case 'system.admin':
        return hasRoleAccess('admin')

      // 顧客管理權限
      case 'customers.view':
        return hasRoleAccess('user')
      case 'customers.create':
      case 'customers.update':
        return hasRoleAccess('user')
      case 'customers.delete':
      case 'customers.import':
        return hasRoleAccess('accountant')

      // 旅遊團管理權限
      case 'groups.view':
        return hasRoleAccess('user')
      case 'groups.create':
      case 'groups.update':
        return hasRoleAccess('user')
      case 'groups.delete':
      case 'groups.manage_bonus':
        return hasRoleAccess('accountant')

      // 訂單管理權限
      case 'orders.view':
      case 'orders.create':
      case 'orders.update':
        return hasRoleAccess('user')
      case 'orders.delete':
        return hasRoleAccess('accountant')

      // 財務管理權限
      case 'invoices.view':
      case 'invoices.create':
      case 'invoices.update':
        return hasRoleAccess('user')
      case 'invoices.delete':
      case 'invoices.confirm':
        return hasRoleAccess('accountant')
      case 'receipts.view':
      case 'receipts.create':
      case 'receipts.update':
        return hasRoleAccess('user')
      case 'receipts.delete':
        return hasRoleAccess('accountant')

      // 供應商管理權限
      case 'suppliers.view':
        return hasRoleAccess('user')
      case 'suppliers.create':
      case 'suppliers.update':
      case 'suppliers.delete':
        return hasRoleAccess('accountant')

      default:
        return false
    }
  }

  const hasAllPermissions = (...permissions: (string | Permission)[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const hasAnyPermission = (...permissions: (string | Permission)[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const canAccess = (resource: string): boolean => {
    if (!user) return false

    // 基本的權限檢查邏輯
    switch (user.role) {
      case 'SUPER_ADMIN':
        return true
      case 'CORNER_EMPLOYEE':
        return resource !== 'admin.system'
      case 'FRIEND':
        return resource === 'life' || resource === 'public'
      default:
        return false
    }
  }

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccess,
    isLoading,
    userRole: user?.role || 'FRIEND'
  }
}