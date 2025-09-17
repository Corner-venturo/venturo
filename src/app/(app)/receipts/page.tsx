/**
 * VenturoERP 收款單主頁面
 * 完全移植自 cornerERP 的收款單功能，配合統一 layout
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'
import { DocumentDuplicateIcon, CurrencyDollarIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ReceiptsTable from './ReceiptsTable'
import { initializeReceiptMockData } from '@/lib/mock/receiptData'

export default function ReceiptsPage() {
  const router = useRouter()

  useEffect(() => {
    // 初始化收款單 Mock 資料
    initializeReceiptMockData()
  }, [])

  // 假設的統計數據（之後可從 API 取得）
  const stats = {
    totalReceipts: 45,
    paidReceipts: 32,
    pendingReceipts: 13,
    totalAmount: 1250000
  }

  return (
    <div className="h-full">
      {/* 標題區域 - 遵循統一規範 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              <span>主要功能</span>
              <span>/</span>
              <span>收款管理</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">收款單</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              管理所有收款記錄，追蹤付款狀態
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              color="zinc"
              onClick={() => router.push('/receipts/batch-create')}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              批量新增
            </Button>
          </div>
        </div>

        {/* 統計 badges */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">總收款單</span>
            <Badge color="blue">{stats.totalReceipts}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">已收款</span>
            <Badge color="green">{stats.paidReceipts}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">待收款</span>
            <Badge color="orange">{stats.pendingReceipts}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">總金額</span>
            <Badge color="purple">{stats.totalAmount.toLocaleString()}</Badge>
          </div>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        <div className="px-8 py-6">
          <ReceiptsTable />
        </div>
      </div>
    </div>
  )
}