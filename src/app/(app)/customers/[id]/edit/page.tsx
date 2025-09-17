'use client'

/**
 * VenturoERP 2.0 編輯顧客頁面
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/stores/customerStore'
import { usePermissions } from '@/hooks/usePermissions'
import { CustomerForm } from '../../components/CustomerForm'
import { CustomerFormData } from '@/types/customer'
import { UserIcon } from '@heroicons/react/24/outline'

interface EditCustomerPageProps {
  params: { id: string }
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const {
    currentCustomer,
    isLoading,
    error,
    fetchCustomerById,
    updateCustomer
  } = useCustomerStore()

  useEffect(() => {
    fetchCustomerById(params.id)
  }, [params.id, fetchCustomerById])

  if (!hasPermission('customers.update')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有權限</h3>
          <p className="mt-1 text-sm text-gray-500">您沒有權限編輯顧客資料</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CustomerFormData): Promise<boolean> => {
    if (!currentCustomer) return false

    const success = await updateCustomer(currentCustomer.id, data)
    if (success) {
      router.push(`/customers/${currentCustomer.id}`)
      return true
    }
    return false
  }

  const handleCancel = () => {
    if (currentCustomer) {
      router.push(`/customers/${currentCustomer.id}`)
    } else {
      router.push('/customers')
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
            <button
              onClick={() => router.push('/customers')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回顧客列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CustomerForm
      mode="edit"
      customer={currentCustomer}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )
}