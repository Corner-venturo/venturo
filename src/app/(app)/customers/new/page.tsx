'use client'

/**
 * VenturoERP 2.0 新增顧客頁面
 */

import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/stores/customerStore'
import { usePermissions } from '@/hooks/usePermissions'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerFormData } from '@/types/customer'
import { UserIcon } from '@heroicons/react/24/outline'

export default function NewCustomerPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { createCustomer, isLoading } = useCustomerStore()

  if (!hasPermission('customers.create')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有權限</h3>
          <p className="mt-1 text-sm text-gray-500">您沒有權限新增顧客</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CustomerFormData): Promise<boolean> => {
    const success = await createCustomer(data)
    if (success) {
      router.push('/customers')
      return true
    }
    return false
  }

  const handleCancel = () => {
    router.push('/customers')
  }

  return (
    <CustomerForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )
}