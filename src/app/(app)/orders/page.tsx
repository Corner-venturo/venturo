'use client'

/**
 * VenturoERP 2.0 訂單管理列表頁
 * 遵循 LAYOUT_ALIGNMENT_GUIDE 的版面規範
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Badge } from '@/components/catalyst/badge'
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useOrderStore } from '@/stores/orderStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { initializeOrderMockData } from '@/lib/mock/orderData'
import { Order, OrderStatus, PaymentStatus, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/types/order'

export default function OrdersPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    orders,
    stats,
    isLoading,
    error,
    selectedIds,
    queryParams,
    fetchOrders,
    fetchStats,
    searchOrders,
    filterByStatus,
    filterByPaymentStatus,
    deleteSelectedOrders,
    toggleSelection,
    selectAll,
    clearSelection,
    resetFilters
  } = useOrderStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // 初始化 Mock 數據
    initializeOrderMockData()

    // 加載數據
    fetchOrders()
    fetchStats()
  }, [fetchOrders, fetchStats])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchOrders(searchTerm)
  }

  const handleStatusFilter = (status: OrderStatus | '') => {
    setStatusFilter(status)
    filterByStatus(status || undefined)
  }

  const handlePaymentStatusFilter = (paymentStatus: PaymentStatus | '') => {
    setPaymentStatusFilter(paymentStatus)
    filterByPaymentStatus(paymentStatus || undefined)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    if (await deleteSelectedOrders()) {
      setShowDeleteConfirm(false)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPaymentStatusFilter('')
    resetFilters()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!hasPermission('orders.view')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有權限</h3>
          <p className="mt-1 text-sm text-gray-500">您沒有權限查看訂單資料</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">訂單管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              管理所有客戶訂單，包含訂單狀態、付款資訊及行程安排
            </p>
            {stats && (
              <div className="mt-4 flex gap-4 flex-wrap">
                <Badge variant="secondary">總計: {stats.total}</Badge>
                <Badge variant="outline" color="gray">草稿: {stats.draft}</Badge>
                <Badge variant="outline" color="yellow">待確認: {stats.pending}</Badge>
                <Badge variant="outline" color="blue">已確認: {stats.confirmed}</Badge>
                <Badge variant="outline" color="purple">處理中: {stats.processing}</Badge>
                <Badge variant="outline" color="green">已完成: {stats.completed}</Badge>
                {stats.cancelled > 0 && (
                  <Badge variant="outline" color="red">已取消: {stats.cancelled}</Badge>
                )}
                <Badge variant="default">本月新增: {stats.thisMonth}</Badge>
                <Badge variant="outline" color="green">
                  總營收: {formatCurrency(stats.totalRevenue)}
                </Badge>
                <Badge variant="outline" color="yellow">
                  待收款: {formatCurrency(stats.totalOutstanding)}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && hasPermission('orders.delete') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                刪除選中 ({selectedIds.length})
              </Button>
            )}
            {hasPermission('orders.create') && (
              <Button onClick={() => router.push('/orders/new')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                新增訂單
              </Button>
            )}
          </div>
        </div>

        {/* 搜尋和篩選區域 */}
        <div className="mt-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="搜尋訂單編號、客戶姓名、聯絡人..."
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

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">所有狀態</option>
              <option value="draft">草稿</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
              <option value="processing">處理中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
              <option value="refunded">已退款</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => handlePaymentStatusFilter(e.target.value as PaymentStatus | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">所有付款狀態</option>
              <option value="unpaid">未付款</option>
              <option value="partial">部分付款</option>
              <option value="paid">已付款</option>
              <option value="refunded">已退款</option>
            </select>

            {(searchTerm || statusFilter || paymentStatusFilter) && (
              <Button variant="ghost" onClick={handleResetFilters}>
                清除篩選
              </Button>
            )}
          </div>
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
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有訂單資料</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || paymentStatusFilter ? '沒有符合篩選條件的訂單' : '開始新增您的第一筆訂單'}
              </p>
              {hasPermission('orders.create') && !searchTerm && !statusFilter && !paymentStatusFilter && (
                <div className="mt-6">
                  <Button onClick={() => router.push('/orders/new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    新增訂單
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
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={() => {
                      if (selectedIds.length === orders.length) {
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
                  共 {orders.length} 筆訂單
                </div>
              </div>

              {/* 訂單列表 */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <OrderListItem
                      key={order.id}
                      order={order}
                      isSelected={selectedIds.includes(order.id)}
                      onToggleSelect={() => toggleSelection(order.id)}
                      onView={() => router.push(`/orders/${order.id}`)}
                      onEdit={() => router.push(`/orders/${order.id}/edit`)}
                      hasEditPermission={hasPermission('orders.update')}
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
                    您確定要刪除選中的 {selectedIds.length} 筆訂單嗎？此操作無法復原。
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

// 訂單列表項目元件
interface OrderListItemProps {
  order: Order
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  hasEditPermission: boolean
}

function OrderListItem({
  order,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  hasEditPermission
}: OrderListItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: OrderStatus): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (paymentStatus: PaymentStatus): string => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-orange-100 text-orange-800'
    }
    return colors[paymentStatus] || 'bg-gray-100 text-gray-800'
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
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {order.order_number}
                  </p>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <UserIcon className="h-3 w-3 mr-1" />
                    {order.customer_name}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(order.order_date)}
                  </span>
                  {order.departure_date && (
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      出發: {formatDate(order.departure_date)}
                    </span>
                  )}
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {formatCurrency(order.final_amount)}
                  </span>
                  {order.remaining_amount > 0 && (
                    <span className="text-red-600">
                      待收: {formatCurrency(order.remaining_amount)}
                    </span>
                  )}
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

          {order.special_requirements && (
            <div className="mt-2 ml-16">
              <p className="text-xs text-gray-600 line-clamp-2">
                特殊需求: {order.special_requirements}
              </p>
            </div>
          )}

          {order.notes && (
            <div className="mt-1 ml-16">
              <p className="text-xs text-gray-600 line-clamp-2">
                備註: {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}