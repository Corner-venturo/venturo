/**
 * Venturo ERP 訂單 API 整合 Hook
 * 用於收款單頁面中的訂單相關操作
 */

import { useState, useEffect } from 'react'

// 訂單介面定義
export interface Order {
  orderNumber: string
  groupCode: string
  groupName: string
  contactPerson: string
  // 其他訂單欄位...
}

// 模擬 API 服務
class OrderAPIService {
  static async getOrder(orderNumber: string): Promise<Order | null> {
    try {
      // 實際實現：調用 /api/orders/{orderNumber}
      const response = await fetch(`/api/orders/${orderNumber}`)
      if (!response.ok) throw new Error('Order not found')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch order:', error)
      return null
    }
  }

  static async getOrders(): Promise<Order[]> {
    try {
      // 實際實現：調用 /api/orders
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
    }
  }
}

// Hook: 獲取單個訂單
export function useGetOrderQuery(orderNumber: string, options: { skip?: boolean } = {}) {
  const [data, setData] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (options.skip || !orderNumber) return

    const fetchOrder = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const order = await OrderAPIService.getOrder(orderNumber)
        setData(order)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber, options.skip])

  return { data, isLoading, isError }
}

// Hook: 獲取訂單列表
export function useGetOrdersQuery(params?: any) {
  const [data, setData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const orders = await OrderAPIService.getOrders()
        setData(orders)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [params])

  return { data, isLoading, isError }
}