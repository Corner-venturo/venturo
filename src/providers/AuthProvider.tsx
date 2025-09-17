'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useGlobalStore } from '@/stores/globalStore'

const publicPaths = ['/', '/login', '/register']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)
  const { initializeFromAuth, clearSession, isLoading } = useGlobalStore()

  useEffect(() => {
    // 檢查初始 session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await initializeFromAuth(session.user.id)
      } else if (!publicPaths.includes(pathname) && pathname !== '/forgot-password') {
        router.push('/login')
      }

      setIsInitialized(true)
    }

    initAuth()

    // 監聽 auth 變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initializeFromAuth(session.user.id)
        router.push('/todos')
      } else if (event === 'SIGNED_OUT') {
        clearSession()
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, initializeFromAuth, clearSession]) // 加入依賴

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-600">載入中...</div>
      </div>
    )
  }

  return <>{children}</>
}