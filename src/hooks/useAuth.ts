'use client'

import { useGlobalStore } from '@/stores/globalStore'

export const useAuth = () => {
  const { user, isLoading } = useGlobalStore()

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  }
}