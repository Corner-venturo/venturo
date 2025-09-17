'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGate } from '@/components/PermissionGate'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface User {
  id: string
  email: string
  display_name: string
  role: string
  created_at: string
  permissions?: string[]
}

export default function UsersManagementPage() {
  const router = useRouter()
  const { hasPermission, loading: permissionLoading, userRole } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // 只在權限載入完成且有權限時載入用戶
    if (!permissionLoading) {
      if (userRole === 'ADMIN') {
        loadUsers()
      }
    }
  }, [permissionLoading, userRole])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // 載入所有用戶
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // 一次查詢所有權限（而不是 N 次）
      const { data: allPermissions, error: permError } = await supabase
        .from('user_permissions')
        .select('user_id, permission')

      if (permError) {
        console.error('Error loading permissions:', permError)
      }

      // 組合資料
      const permissionMap: Record<string, string[]> = {}
      if (allPermissions) {
        allPermissions.forEach(perm => {
          if (!permissionMap[perm.user_id]) {
            permissionMap[perm.user_id] = []
          }
          permissionMap[perm.user_id].push(perm.permission)
        })
      }

      // 合併用戶和權限
      const usersWithPermissions = (profiles || []).map(profile => ({
        ...profile,
        permissions: permissionMap[profile.id] || []
      }))

      setUsers(usersWithPermissions)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'ASSISTANT': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'ACCOUNTANT': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'SALES': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'STAFF': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'PUBLIC': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
    
    const roleLabels: Record<string, string> = {
      'ADMIN': '管理員',
      'ASSISTANT': '特助',
      'ACCOUNTANT': '會計',
      'SALES': '業務',
      'STAFF': '助理',
      'PUBLIC': '一般用戶'
    }

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${roleStyles[role] || roleStyles.PUBLIC}`}>
        {roleLabels[role] || role}
      </span>
    )
  }

  const getPermissionCount = (permissions: string[]) => {
    const workPermissions = permissions.filter(p => p.startsWith('mode.work') || p.includes('project') || p.includes('order'))
    const hasWorkMode = permissions.includes('mode.work')
    
    if (permissions.includes('system.admin')) {
      return <span className="text-red-600 dark:text-red-400">完整權限</span>
    } else if (hasWorkMode) {
      return <span className="text-green-600 dark:text-green-400">工作模式 + {workPermissions.length} 權限</span>
    } else {
      return <span className="text-zinc-600 dark:text-zinc-400">基本權限</span>
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PermissionGate 
      permission="users.manage"
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
              權限不足
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              您沒有權限訪問用戶管理頁面
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              返回 Dashboard
            </Button>
          </div>
        </div>
      }
    >
      <div className="h-full p-8">
        <div className="mx-auto max-w-7xl">
          {/* 標題區 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              用戶管理
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              管理系統用戶與權限設定
            </p>
          </div>

          {/* 搜尋列 */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="搜尋用戶（Email 或姓名）..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* 統計資訊 */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">總用戶數</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{users.length}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">管理員</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">企業用戶</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {users.filter(u => ['ASSISTANT', 'ACCOUNTANT', 'SALES', 'STAFF'].includes(u.role)).length}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">一般用戶</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {users.filter(u => u.role === 'PUBLIC' || !u.role).length}
              </p>
            </div>
          </div>

          {/* 用戶列表 */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-zinc-500">載入中...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                {searchTerm ? '沒有找到符合的用戶' : '還沒有任何用戶'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      用戶
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      權限狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      註冊時間
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {user.display_name}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {getPermissionCount(user.permissions || [])}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          管理權限
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  )
}
