'use client'

/**
 * VenturoERP 2.0 旅遊團管理列表頁
 * 遵循 LAYOUT_ALIGNMENT_GUIDE 的版面規範
 */

import { useEffect, useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Badge } from '@/components/catalyst/badge'
import {
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useTravelGroupStore } from '@/stores/travelGroupStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { initializeTravelGroupMockData } from '@/lib/mock/travelGroupData'
import { TravelGroup, TravelGroupStatus, TRAVEL_GROUP_STATUS_LABELS, TRAVEL_GROUP_STATUS_COLORS } from '@/types/travelGroup'

export default function ToursPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    travelGroups,
    stats,
    isLoading,
    error,
    selectedIds,
    queryParams,
    fetchTravelGroups,
    fetchStats,
    searchTravelGroups,
    filterByStatus,
    deleteSelectedTravelGroups,
    toggleSelection,
    selectAll,
    clearSelection,
    resetFilters
  } = useTravelGroupStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TravelGroupStatus | ''>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // 初始化 Mock 數據
    initializeTravelGroupMockData()

    // 加載數據
    fetchTravelGroups()
    fetchStats()
  }, [fetchTravelGroups, fetchStats])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchTravelGroups(searchTerm)
  }

  const handleStatusFilter = (status: TravelGroupStatus | '') => {
    setStatusFilter(status)
    filterByStatus(status || undefined)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    if (await deleteSelectedTravelGroups()) {
      setShowDeleteConfirm(false)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
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

  const getStatusBadgeColor = (status: TravelGroupStatus) => {
    const colorMap: Record<TravelGroupStatus, any> = {
      planning: 'yellow',
      confirmed: 'blue',
      in_progress: 'green',
      completed: 'gray',
      cancelled: 'red'
    }
    return colorMap[status] || 'gray'
  }

  if (!hasPermission('groups.view')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有權限</h3>
          <p className="mt-1 text-sm text-gray-500">您沒有權限查看旅遊團資料</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">旅遊團管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              管理所有旅遊團行程，包含團體資訊、行程規劃及參團狀況
            </p>
            {stats && (
              <div className="mt-4 flex gap-4 flex-wrap">
                <Badge variant="secondary">總計: {stats.total}</Badge>
                <Badge variant="outline" color="yellow">規劃中: {stats.planning}</Badge>
                <Badge variant="outline" color="blue">已確認: {stats.confirmed}</Badge>
                <Badge variant="outline" color="green">進行中: {stats.in_progress}</Badge>
                <Badge variant="outline" color="gray">已完成: {stats.completed}</Badge>
                {stats.cancelled > 0 && (
                  <Badge variant="outline" color="red">已取消: {stats.cancelled}</Badge>
                )}
                <Badge variant="default">本月新增: {stats.thisMonth}</Badge>
                <Badge variant="outline" color="green">
                  總營收: {formatCurrency(stats.totalRevenue)}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && hasPermission('groups.delete') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                刪除選中 ({selectedIds.length})
              </Button>
            )}
            {hasPermission('groups.create') && (
              <Button onClick={() => router.push('/tours/new')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                新增旅遊團
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
                placeholder="搜尋旅遊團名稱、團號、目的地..."
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
              onChange={(e) => handleStatusFilter(e.target.value as TravelGroupStatus | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">所有狀態</option>
              <option value="planning">規劃中</option>
              <option value="confirmed">已確認</option>
              <option value="in_progress">進行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>

            {(searchTerm || statusFilter) && (
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
          ) : travelGroups.length === 0 ? (
            <div className="text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有旅遊團資料</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter ? '沒有符合篩選條件的旅遊團' : '開始新增您的第一個旅遊團'}
              </p>
              {hasPermission('groups.create') && !searchTerm && !statusFilter && (
                <div className="mt-6">
                  <Button onClick={() => router.push('/tours/new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    新增旅遊團
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
                    checked={travelGroups.length > 0 && selectedIds.length === travelGroups.length}
                    onChange={() => {
                      if (selectedIds.length === travelGroups.length) {
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
                  共 {travelGroups.length} 筆旅遊團
                </div>
              </div>

              {/* 旅遊團列表 */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {travelGroups.map((group) => (
                    <TravelGroupListItem
                      key={group.id}
                      group={group}
                      isSelected={selectedIds.includes(group.id)}
                      onToggleSelect={() => toggleSelection(group.id)}
                      onView={() => router.push(`/tours/${group.id}`)}
                      onEdit={() => router.push(`/tours/${group.id}/edit`)}
                      hasEditPermission={hasPermission('groups.update')}
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
                    您確定要刪除選中的 {selectedIds.length} 個旅遊團嗎？此操作無法復原。
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

// 旅遊團列表項目元件
interface TravelGroupListItemProps {
  group: TravelGroup
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onEdit: () => void
  hasEditPermission: boolean
}

function TravelGroupListItem({
  group,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  hasEditPermission
}: TravelGroupListItemProps) {
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

  const getStatusColor = (status: TravelGroupStatus): string => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {group.group_name}
                  </p>
                  <span className="ml-2 text-xs text-gray-500">
                    ({group.group_code})
                  </span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(group.status)}`}>
                    {TRAVEL_GROUP_STATUS_LABELS[group.status]}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {group.destination}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(group.departure_date)} - {formatDate(group.return_date)}
                  </span>
                  <span className="flex items-center">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    {group.current_participants}/{group.max_participants}人
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {formatCurrency(group.price_per_person)}
                  </span>
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

          {group.description && (
            <div className="mt-2 ml-16">
              <p className="text-xs text-gray-600 line-clamp-2">
                {group.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}