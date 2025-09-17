'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Checkbox } from '@/components/catalyst/checkbox'
import { Select } from '@/components/catalyst/select'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGate } from '@/components/PermissionGate'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  id: string
  email: string
  display_name: string
  role: string
  created_at: string
}

interface PermissionDefinition {
  permission: string
  category: string
  label: string
  description: string
}

export default function UserPermissionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { hasPermission, grantPermission, revokePermission } = usePermissions()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [permissionDefs, setPermissionDefs] = useState<PermissionDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (hasPermission('permissions.grant')) {
      loadUserData()
      loadPermissionDefinitions()
    }
  }, [params.id, hasPermission])

  const loadUserData = async () => {
    try {
      // 載入用戶資料
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (profileError) throw profileError
      setUser(profile)

      // 載入用戶權限
      const { data: permissions, error: permError } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', params.id)

      if (permError) throw permError
      setUserPermissions(permissions?.map(p => p.permission) || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermissionDefinitions = async () => {
    try {
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('category', { ascending: true })
        .order('permission', { ascending: true })

      if (error) throw error
      setPermissionDefs(data || [])
    } catch (error) {
      console.error('Error loading permission definitions:', error)
    }
  }

  const handlePermissionToggle = async (permission: string, checked: boolean) => {
    if (!currentUser) return
    
    setSaving(true)
    try {
      if (checked) {
        // 授予權限
        await grantPermission(params.id, permission)
        setUserPermissions([...userPermissions, permission])
      } else {
        // 撤銷權限
        await revokePermission(params.id, permission)
        setUserPermissions(userPermissions.filter(p => p !== permission))
      }
    } catch (error) {
      console.error('Error updating permission:', error)
      alert('更新權限失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', params.id)

      if (error) throw error
      
      if (user) {
        setUser({ ...user, role: newRole })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('更新角色失敗')
    } finally {
      setSaving(false)
    }
  }

  // 快速授權預設集
  const grantWorkModePermissions = async () => {
    setSaving(true)
    try {
      const workPermissions = [
        'mode.work',
        'projects.view',
        'projects.create',
        'todos.convert',
        'orders.view',
        'customers.view'
      ]

      for (const perm of workPermissions) {
        if (!userPermissions.includes(perm)) {
          await grantPermission(params.id, perm)
        }
      }

      setUserPermissions([...new Set([...userPermissions, ...workPermissions])])
      alert('已授予工作模式權限')
    } catch (error) {
      console.error('Error granting work permissions:', error)
      alert('授權失敗')
    } finally {
      setSaving(false)
    }
  }

  const grantAdminPermissions = async () => {
    if (!confirm('確定要授予完整管理員權限嗎？這將給予用戶系統最高權限。')) return
    
    setSaving(true)
    try {
      // 授予所有權限
      for (const def of permissionDefs) {
        if (!userPermissions.includes(def.permission)) {
          await grantPermission(params.id, def.permission)
        }
      }

      // 更新角色為 ADMIN
      await handleRoleChange('ADMIN')
      
      setUserPermissions(permissionDefs.map(d => d.permission))
      alert('已授予管理員權限')
    } catch (error) {
      console.error('Error granting admin permissions:', error)
      alert('授權失敗')
    } finally {
      setSaving(false)
    }
  }

  // 按類別過濾權限
  const categories = ['all', ...new Set(permissionDefs.map(p => p.category))]
  const filteredPermissions = selectedCategory === 'all' 
    ? permissionDefs 
    : permissionDefs.filter(p => p.category === selectedCategory)

  if (!hasPermission('permissions.grant')) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
            權限不足
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            您沒有權限管理用戶權限
          </p>
          <Button onClick={() => router.push('/admin/users')} className="mt-4">
            返回用戶列表
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-zinc-500">載入中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500">找不到用戶</p>
          <Button onClick={() => router.push('/admin/users')} className="mt-4">
            返回用戶列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-4xl">
        {/* 標題區 */}
        <div className="mb-8">
          <Button onClick={() => router.push('/admin/users')} plain className="mb-4">
            ← 返回用戶列表
          </Button>
          
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            權限管理
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            管理 {user.display_name} 的系統權限
          </p>
        </div>

        {/* 用戶資訊卡片 */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">姓名</p>
              <p className="font-medium text-zinc-900 dark:text-white">{user.display_name}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
              <p className="font-medium text-zinc-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">角色</p>
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={saving}
              >
                <option value="PUBLIC">一般用戶</option>
                <option value="STAFF">助理</option>
                <option value="SALES">業務</option>
                <option value="ACCOUNTANT">會計</option>
                <option value="ASSISTANT">特助</option>
                <option value="ADMIN">管理員</option>
              </Select>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">註冊時間</p>
              <p className="font-medium text-zinc-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 快速授權按鈕 */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            快速授權
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={grantWorkModePermissions}
              disabled={saving || userPermissions.includes('mode.work')}
              outline
            >
              授予工作模式
            </Button>
            <Button
              onClick={grantAdminPermissions}
              disabled={saving || user.role === 'ADMIN'}
              outline
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
            >
              授予管理員權限
            </Button>
          </div>
        </div>

        {/* 權限列表 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              詳細權限設定
            </h2>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">所有類別</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            {filteredPermissions.map((def) => (
              <div
                key={def.permission}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {def.label}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                        {def.category}
                      </span>
                      <code className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                        {def.permission}
                      </code>
                    </div>
                    {def.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {def.description}
                      </p>
                    )}
                  </div>
                  <Checkbox
                    checked={userPermissions.includes(def.permission)}
                    onChange={(checked) => handlePermissionToggle(def.permission, checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 目前權限總覽 */}
        <div className="mt-8 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
            目前擁有的權限 ({userPermissions.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {userPermissions.length === 0 ? (
              <span className="text-sm text-zinc-500">沒有任何權限</span>
            ) : (
              userPermissions.map(perm => (
                <span
                  key={perm}
                  className="rounded-full bg-white px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {perm}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
