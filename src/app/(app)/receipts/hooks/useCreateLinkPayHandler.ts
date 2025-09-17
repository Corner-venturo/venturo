/**
 * Venturo ERP LinkPay 創建 Hook
 * 替代 cornerERP 的 useCreateLinkPayHandler
 */

import { useState } from 'react'
import { CreateLinkPayRequest, CreateLinkPayResponse } from '@/app/api/receipts/ReceiptApi'

// 模擬 LinkPay API 服務
class LinkPayAPIService {
  static async createLinkPay(request: CreateLinkPayRequest): Promise<CreateLinkPayResponse> {
    try {
      // 實際實現：調用 /api/linkpay/create
      const response = await fetch('/api/linkpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      if (!response.ok) throw new Error('Failed to create LinkPay')
      return await response.json()
    } catch (error) {
      console.error('Failed to create LinkPay:', error)
      throw error
    }
  }
}

// Hook: 創建 LinkPay
export function useCreateLinkPayHandler() {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateLinkPay = async (
    receiptNumber: string,
    userName: string,
    email: string,
    paymentName: string = ''
  ) => {
    setIsCreating(true)
    try {
      const request: CreateLinkPayRequest = {
        receiptNumber,
        userName,
        email,
        createUser: 'current-user-id', // 應從認證狀態中獲取
        paymentName
      }

      const result = await LinkPayAPIService.createLinkPay(request)

      if (result.success) {
        console.log('LinkPay 創建成功:', result.data)
        return result.data
      } else {
        throw new Error(result.message || 'LinkPay 創建失敗')
      }
    } catch (error) {
      console.error('LinkPay 創建錯誤:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return {
    handleCreateLinkPay,
    isCreating
  }
}