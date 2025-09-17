'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Disclosure } from '@headlessui/react'
import { useGlobalStore } from '@/stores/globalStore'
import { supabase } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  workOnly?: boolean
  lifeOnly?: boolean
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, currentMode, switchMode, features, clearSession } = useGlobalStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    clearSession()
    router.push('/')
    await supabase.auth.signOut()
  }

  // 完整的導航選單 - 包含所有模組
  const navItems: NavItem[] = [
    // 共用模組（生活 + 工作都有）
    { label: '待辦事項', href: '/todos' },
    { label: '行事曆', href: '/calendar' },

    // 生活模式專屬
    { label: '財務管理', href: '/finance', lifeOnly: true },
    { label: '箱型時間', href: '/timebox', lifeOnly: true },
    { label: '心靈魔法', href: '/soulmagic', lifeOnly: true },

    // 工作模式專屬 - 業務模組
    { label: '專案管理', href: '/projects', workOnly: true },
    { label: '客戶管理', href: '/customers', workOnly: true },
    { label: '團體管理', href: '/groups', workOnly: true },
    { label: '訂單管理', href: '/orders', workOnly: true },
    { label: '收款單', href: '/receipts', workOnly: true },
    { label: '請款單', href: '/invoices', workOnly: true },
    { label: '出納單', href: '/cashflow', workOnly: true },
    { label: '供應商', href: '/suppliers', workOnly: true },
    { label: '網卡管理', href: '/simcards', workOnly: true },
    { label: '員工管理', href: '/employees', workOnly: true },
    { label: '報價單', href: '/quotations', workOnly: true },
    { label: '行程設計', href: '/itinerary', workOnly: true },
    { label: '旅遊團', href: '/tours', workOnly: true },
    { label: '合約', href: '/contracts', workOnly: true },
    { label: '確認單', href: '/confirmations', workOnly: true },
    { label: '成本資料', href: '/costs', workOnly: true },
  ]

  // 管理選單
  const adminNavItems: NavItem[] = [
    { label: '用戶管理', href: '/admin/users' },
    { label: '系統設定', href: '/admin/settings' },
  ]

  // 根據模式和權限過濾選單
  const visibleNavItems = navItems.filter(item => {
    if (item.workOnly) {
      return currentMode === 'work' && features.hasWorkMode
    }
    if (item.lifeOnly) {
      return currentMode === 'life'
    }
    return true
  })

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* 側邊欄 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 transition-all duration-300 flex flex-col`}>

        {/* 品牌標識 */}
        <div className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Venturo</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">ERP System</p>
              </div>
            )}
          </div>
        </div>

        {/* 模式切換 */}
        {features.hasWorkMode && (
          <div className="px-4 mb-4">
            {sidebarOpen ? (
              <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-700">
                <button
                  onClick={() => switchMode('life')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    currentMode === 'life'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  生活
                </button>
                <button
                  onClick={() => switchMode('work')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    currentMode === 'work'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  工作
                </button>
              </div>
            ) : (
              <button
                onClick={() => switchMode(currentMode === 'life' ? 'work' : 'life')}
                className="w-full rounded-lg bg-zinc-100 py-3 text-center text-sm font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                {currentMode === 'life' ? 'L' : 'W'}
              </button>
            )}
          </div>
        )}

        {/* 導航選單 */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span>{sidebarOpen ? item.label : item.label[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 管理選單 */}
        {features.canManageUsers && (
          <>
            <div className="border-t border-zinc-200 px-4 pt-4 dark:border-zinc-700">
              {sidebarOpen && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  系統管理
                </p>
              )}
            </div>
            <nav className="px-4 pb-4">
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white'
                          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <span>{sidebarOpen ? item.label : item.label[0]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}

        {/* 用戶區域 */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
          <div className={`${sidebarOpen ? 'space-y-3' : 'space-y-2'}`}>
            {sidebarOpen && user && (
              <div className="text-sm">
                <p className="font-medium text-zinc-900 dark:text-white">
                  {user.display_name || user.email?.split('@')[0]}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-1 rounded-lg bg-zinc-100 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                {sidebarOpen ? '收起' : '展開'}
              </button>

              {sidebarOpen && (
                <button
                  onClick={handleSignOut}
                  className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  登出
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 主內容區域 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}