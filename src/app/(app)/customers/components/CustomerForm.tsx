'use client'

/**
 * VenturoERP 2.0 顧客表單元件
 * 支援新增和編輯模式
 */

import { useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Badge } from '@/components/catalyst/badge'
import { Customer, CustomerFormData } from '@/types/customer'

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: CustomerFormData) => Promise<boolean>
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_name: customer?.customer_name || '',
    customer_nickname: customer?.customer_nickname || '',
    gender: customer?.gender || undefined,
    birth_date: customer?.birth_date || '',
    id_card: customer?.id_card || '',
    passport_no: customer?.passport_no || '',
    passport_expiry: customer?.passport_expiry || '',
    phone: customer?.phone || '',
    mobile: customer?.mobile || '',
    email: customer?.email || '',
    line_id: customer?.line_id || '',
    address: customer?.address || '',
    emergency_contact: customer?.emergency_contact || '',
    emergency_phone: customer?.emergency_phone || '',
    dietary_restrictions: customer?.dietary_restrictions || '',
    medical_conditions: customer?.medical_conditions || '',
    notes: customer?.notes || '',
    source: customer?.source || '',
    referrer: customer?.referrer || '',
    is_active: customer?.is_active ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_name?.trim()) {
      newErrors.customer_name = '顧客姓名為必填項目'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入正確的電子信箱格式'
    }

    if (formData.mobile && !/^09\d{8}$/.test(formData.mobile)) {
      newErrors.mobile = '手機號碼格式不正確（例：0912345678）'
    }

    if (formData.phone && !/^\d{2,3}-\d{6,8}$/.test(formData.phone)) {
      newErrors.phone = '電話號碼格式不正確（例：02-12345678）'
    }

    if (formData.id_card && !/^[A-Z]\d{9}$/.test(formData.id_card)) {
      newErrors.id_card = '身分證字號格式不正確（例：A123456789）'
    }

    if (formData.birth_date && new Date(formData.birth_date) > new Date()) {
      newErrors.birth_date = '出生日期不能是未來日期'
    }

    if (formData.passport_expiry && new Date(formData.passport_expiry) < new Date()) {
      newErrors.passport_expiry = '護照到期日期不能是過去日期'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const success = await onSubmit(formData)
    if (!success) {
      setErrors({ general: '儲存失敗，請稍後重試' })
    }
  }

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="h-full">
      {/* 標題區域 */}
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {mode === 'create' ? '新增顧客' : '編輯顧客'}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {mode === 'create'
                ? '請填入新顧客的基本資料和聯絡資訊'
                : '修改顧客的基本資料和聯絡資訊'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              取消
            </Button>
            <Button
              type="submit"
              form="customer-form"
              disabled={isLoading}
            >
              {isLoading ? '儲存中...' : (mode === 'create' ? '新增' : '儲存')}
            </Button>
          </div>
        </div>
      </div>

      {/* 表單內容 */}
      <div className="mx-auto max-w-4xl">
        <div className="px-8 py-6">
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <form id="customer-form" onSubmit={handleSubmit} className="space-y-8">
            {/* 基本資料 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">基本資料</h3>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顧客姓名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="請輸入顧客姓名"
                    invalid={!!errors.customer_name}
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    暱稱
                  </label>
                  <Input
                    type="text"
                    value={formData.customer_nickname}
                    onChange={(e) => handleInputChange('customer_nickname', e.target.value)}
                    placeholder="請輸入暱稱"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value || undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">請選擇</option>
                    <option value="M">男</option>
                    <option value="F">女</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出生日期
                  </label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    invalid={!!errors.birth_date}
                  />
                  {errors.birth_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身分證字號
                  </label>
                  <Input
                    type="text"
                    value={formData.id_card}
                    onChange={(e) => handleInputChange('id_card', e.target.value)}
                    placeholder="A123456789"
                    invalid={!!errors.id_card}
                  />
                  {errors.id_card && (
                    <p className="mt-1 text-sm text-red-600">{errors.id_card}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    狀態
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active === true}
                        onChange={() => handleInputChange('is_active', true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">活躍</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active === false}
                        onChange={() => handleInputChange('is_active', false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">停用</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 證件資料 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">證件資料</h3>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    護照號碼
                  </label>
                  <Input
                    type="text"
                    value={formData.passport_no}
                    onChange={(e) => handleInputChange('passport_no', e.target.value)}
                    placeholder="請輸入護照號碼"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    護照到期日
                  </label>
                  <Input
                    type="date"
                    value={formData.passport_expiry}
                    onChange={(e) => handleInputChange('passport_expiry', e.target.value)}
                    invalid={!!errors.passport_expiry}
                  />
                  {errors.passport_expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.passport_expiry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 聯絡資料 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">聯絡資料</h3>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手機號碼
                  </label>
                  <Input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="0912345678"
                    invalid={!!errors.mobile}
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話號碼
                  </label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="02-12345678"
                    invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子信箱
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                    invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LINE ID
                  </label>
                  <Input
                    type="text"
                    value={formData.line_id}
                    onChange={(e) => handleInputChange('line_id', e.target.value)}
                    placeholder="請輸入 LINE ID"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地址
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="請輸入完整地址"
                  />
                </div>
              </div>
            </div>

            {/* 緊急聯絡人 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">緊急聯絡人</h3>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    緊急聯絡人姓名
                  </label>
                  <Input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="請輸入緊急聯絡人姓名"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    緊急聯絡人電話
                  </label>
                  <Input
                    type="text"
                    value={formData.emergency_phone}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    placeholder="請輸入緊急聯絡人電話"
                  />
                </div>
              </div>
            </div>

            {/* 特殊需求 */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">特殊需求與備註</h3>
              </div>
              <div className="px-6 py-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    飲食限制
                  </label>
                  <Input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                    placeholder="例：素食、不吃牛肉、海鮮過敏等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    醫療狀況
                  </label>
                  <Input
                    type="text"
                    value={formData.medical_conditions}
                    onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                    placeholder="例：糖尿病、高血壓、氣喘等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客戶來源
                  </label>
                  <Input
                    type="text"
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    placeholder="例：網路廣告、朋友介紹、FB廣告等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    推薦人
                  </label>
                  <Input
                    type="text"
                    value={formData.referrer}
                    onChange={(e) => handleInputChange('referrer', e.target.value)}
                    placeholder="如果是朋友介紹，請輸入推薦人姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備註
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="其他需要備註的資訊"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}