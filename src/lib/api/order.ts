/**
 * VenturoERP 2.0 訂單管理 API
 * 使用 BaseBusinessAPI + Mock 資料雙軌系統
 */

import { BaseBusinessAPI, APIResponse } from './BaseBusinessAPI'
import { mockDataManager } from '../mock/MockDataManager'
import { Order, OrderItem, OrderQueryParams, OrderStats, OrderStatus, PaymentStatus } from '@/types/order'

class OrderAPI extends BaseBusinessAPI<Order, string, OrderQueryParams> {
  protected tableName = 'orders'
  protected idField = 'id'

  /**
   * 覆寫搜尋過濾器，支援多欄位搜尋
   */
  protected applySearchFilter(query: any, search: string) {
    return query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,contact_person.ilike.%${search}%,contact_phone.ilike.%${search}%`)
  }

  /**
   * 查詢所有訂單 (支援 Mock 模式)
   */
  async getAll(params?: OrderQueryParams): Promise<APIResponse<Order[]>> {
    if (mockDataManager.isEnabled()) {
      let mockParams = { ...params }

      // 處理額外的過濾條件
      if (params?.status || params?.payment_status || params?.customer_id ||
          params?.order_date_from || params?.order_date_to ||
          params?.departure_date_from || params?.departure_date_to) {

        const allData = mockDataManager.getTableData(this.tableName)
        let filteredData = allData

        if (params.status) {
          filteredData = filteredData.filter((item: Order) => item.status === params.status)
        }

        if (params.payment_status) {
          filteredData = filteredData.filter((item: Order) => item.payment_status === params.payment_status)
        }

        if (params.customer_id) {
          filteredData = filteredData.filter((item: Order) => item.customer_id === params.customer_id)
        }

        if (params.order_date_from) {
          filteredData = filteredData.filter((item: Order) =>
            new Date(item.order_date) >= new Date(params.order_date_from!)
          )
        }

        if (params.order_date_to) {
          filteredData = filteredData.filter((item: Order) =>
            new Date(item.order_date) <= new Date(params.order_date_to!)
          )
        }

        if (params.departure_date_from && item.departure_date) {
          filteredData = filteredData.filter((item: Order) =>
            item.departure_date && new Date(item.departure_date) >= new Date(params.departure_date_from!)
          )
        }

        if (params.departure_date_to && item.departure_date) {
          filteredData = filteredData.filter((item: Order) =>
            item.departure_date && new Date(item.departure_date) <= new Date(params.departure_date_to!)
          )
        }

        // 臨時替換資料
        mockDataManager.setTableData(this.tableName, filteredData)
        const result = await mockDataManager.mockGetAll<Order>(this.tableName, mockParams)
        // 恢復原始資料
        mockDataManager.setTableData(this.tableName, allData)

        return result
      }

      return await mockDataManager.mockGetAll<Order>(this.tableName, mockParams)
    }
    return await super.getAll(params)
  }

  /**
   * 依 ID 查詢訂單 (支援 Mock 模式，包含訂單項目)
   */
  async getById(id: string): Promise<APIResponse<Order>> {
    if (mockDataManager.isEnabled()) {
      const orderResponse = await mockDataManager.mockGetById<Order>(this.tableName, id)

      if (orderResponse.success && orderResponse.data) {
        // 同時查詢訂單項目
        const orderItems = mockDataManager.getTableData('order_items')
          .filter((item: OrderItem) => item.order_id === id)

        orderResponse.data.items = orderItems
      }

      return orderResponse
    }
    return await super.getById(id)
  }

  /**
   * 新增訂單 (支援 Mock 模式)
   */
  async create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<Order>> {
    if (mockDataManager.isEnabled()) {
      // 自動生成訂單編號
      if (!data.order_number) {
        const allOrders = mockDataManager.getTableData(this.tableName)
        const orderNumber = this.generateOrderNumber(allOrders.length + 1)
        data.order_number = orderNumber
      }

      // 計算剩餘金額
      data.remaining_amount = data.final_amount - data.paid_amount

      const result = await mockDataManager.mockCreate<Order>(this.tableName, data)

      // 如果有訂單項目，也要新增
      if (result.success && result.data && (data as any).items) {
        const items = (data as any).items.map((item: any, index: number) => ({
          ...item,
          id: `${result.data.id}_item_${index + 1}`,
          order_id: result.data.id
        }))

        // 新增訂單項目到 Mock 資料
        const existingItems = mockDataManager.getTableData('order_items')
        mockDataManager.setTableData('order_items', [...existingItems, ...items])

        result.data.items = items
      }

      return result
    }
    return await super.create(data)
  }

  /**
   * 更新訂單 (支援 Mock 模式)
   */
  async update(id: string, data: Partial<Order>): Promise<APIResponse<Order>> {
    if (mockDataManager.isEnabled()) {
      // 重新計算剩餘金額
      if (data.final_amount !== undefined || data.paid_amount !== undefined) {
        const currentOrder = mockDataManager.getTableData(this.tableName)
          .find((item: Order) => item.id === id)

        if (currentOrder) {
          const finalAmount = data.final_amount ?? currentOrder.final_amount
          const paidAmount = data.paid_amount ?? currentOrder.paid_amount
          data.remaining_amount = finalAmount - paidAmount
        }
      }

      return await mockDataManager.mockUpdate<Order>(this.tableName, id, data)
    }
    return await super.update(id, data)
  }

  /**
   * 刪除訂單 (支援 Mock 模式)
   */
  async delete(id: string): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      // 同時刪除訂單項目
      const orderItems = mockDataManager.getTableData('order_items')
      const filteredItems = orderItems.filter((item: OrderItem) => item.order_id !== id)
      mockDataManager.setTableData('order_items', filteredItems)

      return await mockDataManager.mockDelete(this.tableName, id)
    }
    return await super.delete(id)
  }

  /**
   * 批量刪除訂單 (支援 Mock 模式)
   */
  async deleteMany(ids: string[]): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      // 同時刪除相關的訂單項目
      const orderItems = mockDataManager.getTableData('order_items')
      const filteredItems = orderItems.filter((item: OrderItem) => !ids.includes(item.order_id))
      mockDataManager.setTableData('order_items', filteredItems)

      return await mockDataManager.mockDeleteMany(this.tableName, ids)
    }
    return await super.deleteMany(ids)
  }

  /**
   * 取得訂單統計資料
   */
  async getStats(): Promise<APIResponse<OrderStats>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allOrders = mockDataManager.getTableData(this.tableName) as Order[]
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const stats: OrderStats = {
          total: allOrders.length,
          draft: allOrders.filter(o => o.status === 'draft').length,
          pending: allOrders.filter(o => o.status === 'pending').length,
          confirmed: allOrders.filter(o => o.status === 'confirmed').length,
          processing: allOrders.filter(o => o.status === 'processing').length,
          completed: allOrders.filter(o => o.status === 'completed').length,
          cancelled: allOrders.filter(o => o.status === 'cancelled').length,
          refunded: allOrders.filter(o => o.status === 'refunded').length,
          thisMonth: allOrders.filter(o =>
            new Date(o.created_at) >= thisMonthStart
          ).length,
          totalRevenue: allOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.final_amount, 0),
          totalPaid: allOrders.reduce((sum, o) => sum + o.paid_amount, 0),
          totalOutstanding: allOrders.reduce((sum, o) => sum + o.remaining_amount, 0),
          averageOrderValue: allOrders.length > 0
            ? allOrders.reduce((sum, o) => sum + o.final_amount, 0) / allOrders.length
            : 0
        }

        return {
          success: true,
          data: stats
        }
      }

      // 實際資料庫查詢邏輯
      const { supabase } = await import('@/lib/supabase/client')
      // TODO: 實作實際資料庫統計查詢

      return {
        success: false,
        data: null as any,
        error: 'Database stats not implemented yet'
      }
    } catch (error) {
      return this.handleError(error, 'getStats')
    }
  }

  /**
   * 更新訂單狀態
   */
  async updateStatus(id: string, status: OrderStatus): Promise<APIResponse<Order>> {
    return await this.update(id, { status })
  }

  /**
   * 更新付款狀態
   */
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paidAmount?: number): Promise<APIResponse<Order>> {
    const updateData: Partial<Order> = { payment_status: paymentStatus }

    if (paidAmount !== undefined) {
      updateData.paid_amount = paidAmount
    }

    return await this.update(id, updateData)
  }

  /**
   * 依客戶查詢訂單
   */
  async getByCustomer(customerId: string, params?: OrderQueryParams): Promise<APIResponse<Order[]>> {
    const queryParams = { ...params, customer_id: customerId }
    return await this.getAll(queryParams)
  }

  /**
   * 依業務員查詢訂單
   */
  async getBySalesPerson(salesPerson: string, params?: OrderQueryParams): Promise<APIResponse<Order[]>> {
    const queryParams = { ...params, sales_person: salesPerson }
    return await this.getAll(queryParams)
  }

  /**
   * 依日期範圍查詢訂單
   */
  async getByDateRange(startDate: string, endDate: string, dateType: 'order' | 'departure' = 'order'): Promise<APIResponse<Order[]>> {
    const queryParams: OrderQueryParams = {}

    if (dateType === 'order') {
      queryParams.order_date_from = startDate
      queryParams.order_date_to = endDate
    } else {
      queryParams.departure_date_from = startDate
      queryParams.departure_date_to = endDate
    }

    return await this.getAll(queryParams)
  }

  /**
   * 產生訂單編號
   */
  private generateOrderNumber(orderCount: number): string {
    const now = new Date()
    const year = now.getFullYear().toString().slice(2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const sequence = String(orderCount).padStart(4, '0')

    return `ORD${year}${month}${sequence}`
  }
}

export const orderAPI = new OrderAPI()