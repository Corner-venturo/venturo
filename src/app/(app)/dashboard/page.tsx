'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('PUBLIC')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchUserRole()
    }
  }, [loading, user, router])

  const fetchUserRole = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setUserRole(data.role)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">載入中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': '🔴 管理員',
      'ASSISTANT': '🟠 特助',
      'ACCOUNTANT': '🟡 會計',
      'SALES': '🟢 業務',
      'STAFF': '🔵 助理',
      'PUBLIC': '⚪ 一般用戶'
    }
    return roleMap[role] || role
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="px-[15px] py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <Button onClick={handleSignOut} outline>
            登出
          </Button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
            歡迎回來！
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            用戶 Email: {user.email}
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            用戶角色: {getRoleBadge(userRole)}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 生活模式卡片 - 所有人都有 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              生活模式
            </h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              管理個人生活，包含待辦事項、行事曆、財務
            </p>
            <Button onClick={() => router.push('/todos?mode=life')} className="w-full">
              進入生活模式
            </Button>
          </div>

          {/* 工作模式卡片 - 只有員工以上才顯示 */}
          {userRole !== 'PUBLIC' ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                工作模式
              </h3>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                專業企業管理，專案協作、ERP 系統
              </p>
              <Button onClick={() => router.push('/todos?mode=work')} className="w-full">
                進入工作模式
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-600 dark:bg-zinc-800/50">
              <h3 className="mb-2 text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                工作模式
              </h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
                升級為企業用戶即可使用工作模式功能
              </p>
              <Button disabled className="w-full opacity-50">
                需要權限
              </Button>
            </div>
          )}

          {/* 設定卡片 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              系統設定
            </h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              個人資料、偏好設定、權限管理
            </p>
            <Button onClick={() => router.push('/settings')} className="w-full" outline>
              管理設定
            </Button>
          </div>
        </div>

        {/* 提示區 - 只對一般用戶顯示 */}
        {userRole === 'PUBLIC' && (
          <div className="mt-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 提示：您目前是一般用戶，可以使用所有生活模式功能。如需使用工作模式和企業功能，請聯繫管理員升級權限。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
