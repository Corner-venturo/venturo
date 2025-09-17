'use client'

/**
 * VenturoERP 2.0 顾客管理列表页
 * 遵循 LAYOUT_ALIGNMENT_GUIDE 的版面规范
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Badge } from '@/components/catalyst/badge'
import {
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useCustomerStore } from '@/stores/customerStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { initializeCustomerMockData } from '@/lib/mock/customerData'
import { Customer } from '@/types/customer'
import '@/lib/test/customerTest'

export default function CustomersPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    customers,
    stats,
    isLoading,
    error,
    selectedIds,
    fetchCustomers,
    fetchStats,
    searchCustomers,
    deleteSelectedCustomers,
    toggleSelection,
    selectAll,
    clearSelection
  } = useCustomerStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // 初始化 Mock 数据
    initializeCustomerMockData()

    // 加载数据
    fetchCustomers()
    fetchStats()
  }, [fetchCustomers, fetchStats])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchCustomers(searchTerm)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    if (await deleteSelectedCustomers()) {
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'M': return '男'
      case 'F': return '女'
      default: return '-'
    }
  }

  if (!hasPermission('customers.view')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有權限</h3>
          <p className="mt-1 text-sm text-gray-500">您沒有權限查看顧客資料</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">顧客管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              管理所有顧客資料，包含基本資料、聯絡方式及旅遊偏好
            </p>
            {stats && (
              <div className="mt-4 flex gap-4">
                <Badge variant="secondary">總計: {stats.total}</Badge>
                <Badge variant="default">活躍: {stats.active}</Badge>
                <Badge variant="outline">本月新增: {stats.thisMonth}</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && hasPermission('customers.delete') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                刪除選中 ({selectedIds.length})
              </Button>
            )}
            {hasPermission('customers.create') && (
              <Button onClick={() => router.push('/customers/new')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                新增顧客
              </Button>
            )}
          </div>
        </div>

        {/* 搜尋區域 */}
        <div className="mt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="搜尋顧客姓名、電話、email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="outline">
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              搜尋
            </Button>
          </form>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        <div className="px-8 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">載入中...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有顧客資料</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? '沒有符合搜尋條件的顧客' : '開始新增您的第一個顧客'}
              </p>
              {hasPermission('customers.create') && !searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => router.push('/customers/new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    新增顧客
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 批量操作列 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={customers.length > 0 && selectedIds.length === customers.length}
                    onChange={() => {
                      if (selectedIds.length === customers.length) {
                        clearSelection()
                      } else {
                        selectAll()
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedIds.length > 0 ? `已選擇 ${selectedIds.length} 筆` : '全選'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  共 {customers.length} 筆顧客資料
                </div>
              </div>

              {/* 顧客列表 */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <CustomerListItem
                      key={customer.id}
                      customer={customer}
                      isSelected={selectedIds.includes(customer.id)}
                      onToggleSelect={() => toggleSelection(customer.id)}
                      onView={() => router.push(`/customers/${customer.id}`)}
                      onEdit={() => router.push(`/customers/${customer.id}/edit`)}
                      hasEditPermission={hasPermission('customers.update')}
                    />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  確認刪除
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    您確定要刪除選中的 {selectedIds.length} 位顧客嗎？此操作無法復原。
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={isLoading}
                className="w-full sm:ml-3 sm:w-auto"
              >
                確認刪除
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 顧客列表項目元件
interface CustomerListItemProps {
  customer: Customer
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  hasEditPermission: boolean
}

function CustomerListItem({
  customer,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  hasEditPermission
}: CustomerListItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'M': return '男'
      case 'F': return '女'
      default: return '-'
    }
  }

  return (
    <li className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {customer.customer_name}
                  </p>
                  {customer.customer_nickname && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({customer.customer_nickname})
                    </span>
                  )}
                  <Badge
                    variant={customer.is_active ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {customer.is_active ? '活躍' : '停用'}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                  {customer.gender && (
                    <span>{getGenderText(customer.gender)}</span>
                  )}
                  {customer.mobile && (
                    <span>{customer.mobile}</span>
                  )}
                  {customer.email && (
                    <span>{customer.email}</span>
                  )}
                  <span>建立於 {formatDate(customer.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onView}>
                <EyeIcon className="h-4 w-4" />
              </Button>
              {hasEditPermission && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {customer.notes && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 line-clamp-2">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}