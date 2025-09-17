'use client'

import { Button } from '@/components/catalyst/button'
import { Link } from '@/components/catalyst/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
            VenturoERP 2.0
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Work-Life Integration, Not Balance
          </p>
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
            不是平衡生活與工作，而是讓兩者自然融合
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button href="/login">
              開始使用
            </Button>
            <Button href="/register" outline>
              建立帳號
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {/* 生活模式 */}
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <span className="text-white text-lg font-bold">L</span>
                  </div>
                  生活模式
                </dt>
                <dd className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  個人化的生活管理工具，包含待辦事項、行事曆、財務管理
                </dd>
              </div>

              {/* 工作模式 */}
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <span className="text-white text-lg font-bold">W</span>
                  </div>
                  工作模式
                </dt>
                <dd className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  專業的企業管理功能，專案管理、團隊協作、ERP 系統
                </dd>
              </div>

              {/* 無縫切換 */}
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <span className="text-white text-lg font-bold">S</span>
                  </div>
                  無縫切換
                </dt>
                <dd className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  智能模式切換，依時間自動建議，保留個人資料隱私
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 特色功能 */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white mb-8">
            原創特色功能
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                箱型時間 (Timebox)
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                自律時間管理系統，將任務放入固定時間箱，專注執行並追蹤效率
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                心靈魔法 (Soul Magic)
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                習慣養成追蹤系統，目標視覺化，建立個人成長儀式
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                模擬人生 (Sims Life)
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                遊戲化人生管理，角色成長系統（開發中）
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-700">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            © 2025 VenturoERP. Internal Use Only.
          </p>
        </div>
      </footer>
    </div>
  )
}
