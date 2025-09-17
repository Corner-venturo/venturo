/**
 * Venturo ERP 收款單 API 整合 Hook
 * 提供統一的 API 接口，替代原 cornerERP 的 RTK Query
 */

import { useState, useEffect } from 'react'
import { Receipt, ReceiptQueryParams } from '@/app/api/receipts/ReceiptApi'

// 模擬 API 調用 - 實際應連接到 Venturo 的後端 API
class ReceiptAPIService {
  static async getReceipt(receiptNumber: string): Promise<Receipt | null> {
    try {
      // 實際實現：調用 /api/receipts/{receiptNumber}
      const response = await fetch(`/api/receipts/${receiptNumber}`)
      if (!response.ok) throw new Error('Receipt not found')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch receipt:', error)
      return null
    }
  }

  static async getReceiptsByOrderNumber(orderNumber: string): Promise<Receipt[]> {
    try {
      // 實際實現：調用 /api/receipts?orderNumber={orderNumber}
      const response = await fetch(`/api/receipts?orderNumber=${orderNumber}`)
      if (!response.ok) throw new Error('Receipts not found')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch receipts by order:', error)
      return []
    }
  }

  static async getReceipts(params?: ReceiptQueryParams): Promise<Receipt[]> {
    try {
      const queryString = params ? new URLSearchParams(params as any).toString() : ''
      const response = await fetch(`/api/receipts${queryString ? '?' + queryString : ''}`)
      if (!response.ok) throw new Error('Failed to fetch receipts')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
      return []
    }
  }

  static async createReceipt(receipt: Partial<Receipt>): Promise<Receipt> {
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt)
      })
      if (!response.ok) throw new Error('Failed to create receipt')
      return await response.json()
    } catch (error) {
      console.error('Failed to create receipt:', error)
      throw error
    }
  }

  static async updateReceipt(receipt: Receipt): Promise<Receipt> {
    try {
      const response = await fetch(`/api/receipts/${receipt.receiptNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt)
      })
      if (!response.ok) throw new Error('Failed to update receipt')
      return await response.json()
    } catch (error) {
      console.error('Failed to update receipt:', error)
      throw error
    }
  }

  static async deleteReceipt(receiptNumber: string): Promise<void> {
    try {
      const response = await fetch(`/api/receipts/${receiptNumber}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete receipt')
    } catch (error) {
      console.error('Failed to delete receipt:', error)
      throw error
    }
  }
}

// Hook: 獲取單個收款單
export function useGetReceiptQuery(receiptNumber: string, options: { skip?: boolean } = {}) {
  const [data, setData] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (options.skip || !receiptNumber) return

    const fetchReceipt = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const receipt = await ReceiptAPIService.getReceipt(receiptNumber)
        setData(receipt)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipt()
  }, [receiptNumber, options.skip])

  return { data, isLoading, isError }
}

// Hook: 按訂單編號獲取收款單列表
export function useGetReceiptsByOrderNumberQuery(orderNumber: string) {
  const [data, setData] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!orderNumber) return

    const fetchReceipts = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const receipts = await ReceiptAPIService.getReceiptsByOrderNumber(orderNumber)
        setData(receipts)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipts()
  }, [orderNumber])

  return { data, isLoading, isError }
}

// Hook: 創建收款單
export function useCreateReceiptMutation() {
  const [isLoading, setIsLoading] = useState(false)

  const createReceipt = async (receipt: Partial<Receipt>) => {
    setIsLoading(true)
    try {
      const result = await ReceiptAPIService.createReceipt(receipt)
      return {
        unwrap: () => Promise.resolve(result)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return [createReceipt, { isLoading }] as const
}

// Hook: 更新收款單
export function useUpdateReceiptMutation() {
  const [isLoading, setIsLoading] = useState(false)

  const updateReceipt = async (receipt: Receipt) => {
    setIsLoading(true)
    try {
      const result = await ReceiptAPIService.updateReceipt(receipt)
      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return [updateReceipt, { isLoading }] as const
}

// Hook: 刪除收款單
export function useDeleteReceiptMutation() {
  const [isLoading, setIsLoading] = useState(false)

  const deleteReceipt = async (receiptNumber: string) => {
    setIsLoading(true)
    try {
      await ReceiptAPIService.deleteReceipt(receiptNumber)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return [deleteReceipt, { isLoading }] as const
}

// Hook: 獲取收款單列表
export function useGetReceiptsQuery(params?: ReceiptQueryParams) {
  const [data, setData] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchReceipts = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const receipts = await ReceiptAPIService.getReceipts(params)
        setData(receipts)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipts()
  }, [params])

  return { data, isLoading, isError }
}