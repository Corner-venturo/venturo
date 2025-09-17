'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/catalyst/button'
import CalendarView from '@/components/features/calendar/CalendarView'
import { useGlobalStore } from '@/stores/globalStore'

export default function CalendarPage() {
  const { user, currentMode, switchMode, features } = useGlobalStore()
  const [localMode, setLocalMode] = useState<'life' | 'work'>('life')

  // 同步全局模式狀態
  useEffect(() => {
    setLocalMode(currentMode)
  }, [currentMode])

  const handleModeSwitch = (mode: 'life' | 'work') => {
    if (mode === 'work' && !features.hasWorkMode) {
      // 使用 toast 而不是 alert（符合開發規範）
      console.warn('您沒有權限使用工作模式')
      return
    }

    switchMode(mode)
  }

  if (!user) {
    return (
      <div className="h-full">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">請先登入</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">您需要登入才能查看行事曆</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* 標題區域 - 有內距 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              行事曆
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {localMode === 'life'
                ? '管理個人行程與活動'
                : '管理會議與專案排程'}
            </p>
          </div>

          {/* 功能按鈕區域 - 右上角對齊 */}
          <div className="flex items-center gap-4">
            {/* 模式切換按鈕 - 只有有權限的用戶才顯示，且不重複側邊欄功能 */}
            {features.hasWorkMode && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleModeSwitch('life')}
                  outline={localMode !== 'life'}
                  size="sm"
                >
                  生活模式
                </Button>
                <Button
                  onClick={() => handleModeSwitch('work')}
                  outline={localMode !== 'work'}
                  size="sm"
                >
                  工作模式
                </Button>
              </div>
            )}

            <Button href="/todos" outline size="sm">
              新增待辦
            </Button>
          </div>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        {/* 實際內容 - 有內距 */}
        <div className="px-8 py-6">
          <CalendarView mode={localMode} />
        </div>
      </div>
    </div>
  )
}
