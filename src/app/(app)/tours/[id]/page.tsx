'use client'

/**
 * VenturoERP 2.0 旅遊團詳細頁面
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTravelGroupStore } from '@/stores/travelGroupStore'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'
import {
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  InformationCircleIcon,
  HomeIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { TravelGroup, TravelGroupStatus, TRAVEL_GROUP_STATUS_LABELS } from '@/types/travelGroup'

interface TravelGroupDetailPageProps {
  params: { id: string }
}

export default function TravelGroupDetailPage({ params }: TravelGroupDetailPageProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    currentTravelGroup,
    isLoading,
    error,
    fetchTravelGroupById,
    deleteTravelGroup,
    updateTravelGroupStatus
  } = useTravelGroupStore()

  useEffect(() => {
    fetchTravelGroupById(params.id)
  }, [params.id, fetchTravelGroupById])

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

  const handleEdit = () => {
    router.push(`/tours/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!currentTravelGroup) return

    const confirmed = confirm(`確定要刪除旅遊團「${currentTravelGroup.group_name}」嗎？此操作無法復原。`)
    if (confirmed) {
      const success = await deleteTravelGroup(currentTravelGroup.id)
      if (success) {
        router.push('/tours')
      }
    }
  }

  const handleStatusChange = async (newStatus: TravelGroupStatus) => {
    if (!currentTravelGroup) return

    const confirmed = confirm(`確定要將旅遊團狀態更改為「${TRAVEL_GROUP_STATUS_LABELS[newStatus]}」嗎？`)
    if (confirmed) {
      await updateTravelGroupStatus(currentTravelGroup.id, newStatus)
    }
  }

  const handleBack = () => {
    router.push('/tours')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !currentTravelGroup) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">找不到旅遊團</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || '指定的旅遊團不存在或已被刪除'}
          </p>
          <div className="mt-6">
            <Button onClick={handleBack}>返回旅遊團列表</Button>
          </div>
        </div>
      </div>
    )
  }

  const group = currentTravelGroup

  return (
    <div className="h-full">
      {/* 標題區域 */}
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleBack}>
                ← 返回列表
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {group.group_name}
                  </h1>
                  <span className="text-lg text-gray-500">
                    ({group.group_code})
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(group.status)}`}>
                    {TRAVEL_GROUP_STATUS_LABELS[group.status]}
                  </span>
                  <Badge variant="outline">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {group.destination}
                  </Badge>
                  <Badge variant="outline">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    {group.current_participants}/{group.max_participants}人
                  </Badge>
                  <Badge variant="outline">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {formatCurrency(group.price_per_person)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 狀態變更按鈕 */}
            {hasPermission('groups.update') && group.status !== 'completed' && group.status !== 'cancelled' && (
              <div className="flex gap-2">
                {group.status === 'planning' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('confirmed')}
                  >
                    確認團體
                  </Button>
                )}
                {group.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('in_progress')}
                  >
                    開始出團
                  </Button>
                )}
                {group.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('completed')}
                  >
                    完成行程
                  </Button>
                )}
                {group.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    取消團體
                  </Button>
                )}
              </div>
            )}

            {hasPermission('groups.update') && (
              <Button variant="outline" onClick={handleEdit}>
                <PencilIcon className="h-4 w-4 mr-2" />
                編輯
              </Button>
            )}
            {hasPermission('groups.delete') && (
              <Button variant="destructive" onClick={handleDelete}>
                <TrashIcon className="h-4 w-4 mr-2" />
                刪除
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="mx-auto max-w-4xl">
        <div className="px-8 py-6 space-y-6">
          {/* 基本資訊 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                基本資訊
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">團體名稱</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.group_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">團號</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.group_code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">目的地</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.destination}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">行程天數</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.duration_days}天</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">出發日期</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(group.departure_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">回程日期</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(group.return_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">參團人數</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {group.current_participants}/{group.max_participants}人
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.round((group.current_participants / group.max_participants) * 100)}%滿團)
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">每人團費</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(group.price_per_person)}</dd>
                </div>
              </dl>

              {group.description && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">行程簡介</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{group.description}</dd>
                </div>
              )}
            </div>
          </div>

          {/* 行程安排 */}
          {group.itinerary_summary && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  行程安排
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{group.itinerary_summary}</p>
              </div>
            </div>
          )}

          {/* 服務資訊 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                服務資訊
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {group.accommodation_info && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    住宿安排
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.accommodation_info}</dd>
                </div>
              )}
              {group.transportation_info && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <TruckIcon className="h-4 w-4 mr-1" />
                    交通安排
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.transportation_info}</dd>
                </div>
              )}
              {group.meal_info && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">餐食安排</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.meal_info}</dd>
                </div>
              )}
              {group.guide_assignment && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">導遊安排</dt>
                  <dd className="mt-1 text-sm text-gray-900">{group.guide_assignment}</dd>
                </div>
              )}
            </div>
          </div>

          {/* 集合資訊 */}
          {(group.meeting_point || group.meeting_time) && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  集合資訊
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.meeting_point && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">集合地點</dt>
                      <dd className="mt-1 text-sm text-gray-900">{group.meeting_point}</dd>
                    </div>
                  )}
                  {group.meeting_time && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">集合時間</dt>
                      <dd className="mt-1 text-sm text-gray-900">{group.meeting_time}</dd>
                    </div>
                  )}
                  {group.contact_person && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">聯絡人</dt>
                      <dd className="mt-1 text-sm text-gray-900">{group.contact_person}</dd>
                    </div>
                  )}
                  {group.contact_phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">聯絡電話</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${group.contact_phone}`} className="text-blue-600 hover:text-blue-800">
                          {group.contact_phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* 費用資訊 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                費用資訊
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">每人團費</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(group.price_per_person)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">預估總營收</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(group.price_per_person * group.current_participants)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">總成本</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatCurrency(group.total_cost)}</dd>
                </div>
                {group.profit_margin && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">利潤率</dt>
                    <dd className="mt-1 text-sm text-gray-900">{group.profit_margin}%</dd>
                  </div>
                )}
                {group.early_bird_discount && group.early_bird_discount > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">早鳥優惠</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(group.early_bird_discount)}</dd>
                  </div>
                )}
                {group.bonus_points && group.bonus_points > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">贈送點數</dt>
                    <dd className="mt-1 text-sm text-gray-900">{group.bonus_points}點</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* 備註事項 */}
          {(group.special_notes || group.cancellation_policy || group.insurance_info) && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">備註事項</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {group.special_notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">特殊事項</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{group.special_notes}</dd>
                  </div>
                )}
                {group.cancellation_policy && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">取消政策</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{group.cancellation_policy}</dd>
                  </div>
                )}
                {group.insurance_info && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">保險資訊</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{group.insurance_info}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 系統資訊 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">系統資訊</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">建立時間</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(group.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">最後更新</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(group.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}