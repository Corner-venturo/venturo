/**
 * Venturo ERP 認證 Hook
 * 提供用戶認證和權限管理功能
 */

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  roles: string[]
  level: number
  experience: number
  coins: number
  worldMode: 'corner' | 'game'
  settings: any
  isActive: boolean
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

// 模擬 Auth 服務
class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      // 實際實現：從 Supabase 或其他認證服務獲取用戶資訊
      const response = await fetch('/api/auth/me')
      if (!response.ok) throw new Error('Not authenticated')
      return await response.json()
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  static async getSession(): Promise<AuthSession | null> {
    try {
      // 實際實現：獲取當前會話
      const response = await fetch('/api/auth/session')
      if (!response.ok) throw new Error('No session')
      return await response.json()
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }
}

// Hook: 認證狀態管理
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const [currentUser, currentSession] = await Promise.all([
          AuthService.getCurrentUser(),
          AuthService.getSession()
        ])
        setUser(currentUser)
        setSession(currentSession)
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user
  }
}

// Hook: 用戶資訊 (相容 cornerERP 的 useUser)
export function useUser() {
  const { user, isLoading } = useAuth()

  return {
    data: user,
    isLoading,
    isError: !user && !isLoading
  }
}

// 權限檢查工具
export const FuseUtils = {
  hasPermission: (requiredRoles: string[], userRoles: string[] = []): boolean => {
    if (!requiredRoles.length) return true
    return requiredRoles.some(role => userRoles.includes(role))
  }
}

// 權限角色定義
export const authRoles = {
  superAdmin: ['SUPER_ADMIN'],
  admin: ['SUPER_ADMIN', 'ADMIN'],
  cornerEmployee: ['SUPER_ADMIN', 'ADMIN', 'CORNER_EMPLOYEE'],
  accountant: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'],
  friend: ['SUPER_ADMIN', 'ADMIN', 'CORNER_EMPLOYEE', 'FRIEND'],
  user: ['SUPER_ADMIN', 'ADMIN', 'CORNER_EMPLOYEE', 'FRIEND', 'USER']
}