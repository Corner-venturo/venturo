'use client'

/**
 * VenturoERP 2.0 顧客詳細頁面
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/stores/customerStore'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'

interface CustomerDetailPageProps {
  params: { id: string }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    currentCustomer,
    isLoading,
    error,
    fetchCustomerById,
    deleteCustomer
  } = useCustomerStore()

  useEffect(() => {
    fetchCustomerById(params.id)
  }, [params.id, fetchCustomerById])

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

  const handleEdit = () => {
    router.push(`/customers/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!currentCustomer) return

    const confirmed = confirm(`確定要刪除顧客「${currentCustomer.customer_name}」嗎？此操作無法復原。`)
    if (confirmed) {
      const success = await deleteCustomer(currentCustomer.id)
      if (success) {
        router.push('/customers')
      }
    }
  }

  const handleBack = () => {
    router.push('/customers')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'M': return '男'
      case 'F': return '女'
      default: return '未設定'
    }
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

  if (error || !currentCustomer) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">找不到顧客</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || '指定的顧客不存在或已被刪除'}
          </p>
          <div className="mt-6">
            <Button onClick={handleBack}>返回顧客列表</Button>
          </div>
        </div>
      </div>
    )
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">
                  {currentCustomer.customer_name}
                  {currentCustomer.customer_nickname && (
                    <span className="ml-2 text-lg text-gray-500">
                      ({currentCustomer.customer_nickname})
                    </span>
                  )}
                </h1>
                <div className="mt-2 flex items-center space-x-3">
                  <Badge variant={currentCustomer.is_active ? "default" : "secondary"}>
                    {currentCustomer.is_active ? '活躍顧客' : '停用顧客'}
                  </Badge>
                  {currentCustomer.source && (
                    <Badge variant="outline">來源: {currentCustomer.source}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasPermission('customers.update') && (
              <Button variant="outline" onClick={handleEdit}>
                <PencilIcon className="h-4 w-4 mr-2" />
                編輯
              </Button>
            )}
            {hasPermission('customers.delete') && (
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
          {/* 基本資料 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                基本資料
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">姓名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentCustomer.customer_name}</dd>
                </div>
                {currentCustomer.customer_nickname && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentCustomer.customer_nickname}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">性別</dt>
                  <dd className="mt-1 text-sm text-gray-900">{getGenderText(currentCustomer.gender)}</dd>
                </div>
                {currentCustomer.birth_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">出生日期</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(currentCustomer.birth_date)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* 證件資料 */}
          {(currentCustomer.id_card || currentCustomer.passport_no) && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <IdentificationIcon className="h-5 w-5 mr-2" />
                  證件資料
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {currentCustomer.id_card && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">身分證字號</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentCustomer.id_card}</dd>
                    </div>
                  )}
                  {currentCustomer.passport_no && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">護照號碼</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentCustomer.passport_no}</dd>
                    </div>
                  )}
                  {currentCustomer.passport_expiry && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">護照到期日</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(currentCustomer.passport_expiry)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* 聯絡資料 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                聯絡資料
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {currentCustomer.mobile && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">手機號碼</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${currentCustomer.mobile}`} className="text-blue-600 hover:text-blue-800">
                        {currentCustomer.mobile}
                      </a>
                    </dd>
                  </div>
                )}
                {currentCustomer.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電話號碼</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${currentCustomer.phone}`} className="text-blue-600 hover:text-blue-800">
                        {currentCustomer.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {currentCustomer.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電子信箱</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${currentCustomer.email}`} className="text-blue-600 hover:text-blue-800">
                        {currentCustomer.email}
                      </a>
                    </dd>
                  </div>
                )}
                {currentCustomer.line_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">LINE ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentCustomer.line_id}</dd>
                  </div>
                )}
              </dl>
              {currentCustomer.address && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    地址
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentCustomer.address}</dd>
                </div>
              )}
            </div>
          </div>

          {/* 緊急聯絡人 */}
          {(currentCustomer.emergency_contact || currentCustomer.emergency_phone) && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">緊急聯絡人</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {currentCustomer.emergency_contact && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">聯絡人姓名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentCustomer.emergency_contact}</dd>
                    </div>
                  )}
                  {currentCustomer.emergency_phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">聯絡人電話</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${currentCustomer.emergency_phone}`} className="text-blue-600 hover:text-blue-800">
                          {currentCustomer.emergency_phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* 特殊需求與備註 */}
          {(currentCustomer.dietary_restrictions || currentCustomer.medical_conditions || currentCustomer.notes) && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">特殊需求與備註</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {currentCustomer.dietary_restrictions && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">飲食限制</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentCustomer.dietary_restrictions}</dd>
                  </div>
                )}
                {currentCustomer.medical_conditions && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">醫療狀況</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentCustomer.medical_conditions}</dd>
                  </div>
                )}
                {currentCustomer.referrer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">推薦人</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentCustomer.referrer}</dd>
                  </div>
                )}
                {currentCustomer.notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">備註</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{currentCustomer.notes}</dd>
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
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(currentCustomer.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">最後更新</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(currentCustomer.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}