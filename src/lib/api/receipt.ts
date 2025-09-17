/**
 * VenturoERP 收款單 API
 * 完全移植 cornerERP 的收款單業務邏輯
 */

import { BaseBusinessAPI, APIResponse } from './BaseBusinessAPI'
import { mockDataManager } from '../mock/MockDataManager'
import {
  Receipt,
  ReceiptQueryParams,
  ReceiptStats,
  CreateLinkPayRequest,
  CreateLinkPayResponse,
  BatchCreateReceiptRequest
} from '@/types/receipt'
import { RECEIPT_STATUS } from '@/constants/receiptStatus'

class ReceiptAPI extends BaseBusinessAPI<Receipt, string, ReceiptQueryParams> {
  protected tableName = 'receipts'
  protected idField = 'receiptNumber'

  /**
   * 覆寫搜尋過濾器，支援多欄位搜尋
   */
  protected applySearchFilter(query: any, search: string) {
    return query.or(`receipt_number.ilike.%${search}%,order_number.ilike.%${search}%,group_code.ilike.%${search}%,email.ilike.%${search}%,note.ilike.%${search}%`)
  }

  /**
   * 覆寫查詢以支援複雜的 JOIN 查詢
   */
  protected buildQuery(params?: ReceiptQueryParams) {
    const { supabase } = require('@/lib/supabase/client')

    // 基礎查詢包含 orders 和 groups 的關聯資料
    let query = supabase.from(this.tableName).select(`
      *,
      orders:order_number (
        group_code,
        groups:group_code (
          group_name
        )
      )
    `)

    if (params) {
      // 收款單號過濾
      if (params.receiptNumber) {
        query = query.ilike('receipt_number', `%${params.receiptNumber}%`)
      }

      // 訂單編號過濾
      if (params.orderNumber) {
        query = query.ilike('order_number', `%${params.orderNumber}%`)
      }

      // 團號過濾
      if (params.groupCode) {
        query = query.ilike('group_code', `%${params.groupCode}%`)
      }

      // 狀態過濾 (支援陣列)
      if (params.status && params.status.length > 0) {
        query = query.in('status', params.status)
      }

      // 收款方式過濾
      if (params.receiptType !== undefined && params.receiptType !== null) {
        query = query.eq('receipt_type', params.receiptType)
      }

      // 日期範圍過濾
      if (params.dateFrom) {
        query = query.gte('receipt_date', params.dateFrom)
      }
      if (params.dateTo) {
        query = query.lte('receipt_date', params.dateTo)
      }

      // 搜尋過濾
      if (params.search) {
        query = this.applySearchFilter(query, params.search)
      }

      // 排序
      const sortBy = params.sortBy || 'created_at'
      const sortOrder = params.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // 分頁
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
      }
    }

    return query
  }

  /**
   * 查詢所有收款單 (支援 Mock 模式)
   */
  async getAll(params?: ReceiptQueryParams): Promise<APIResponse<Receipt[]>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockGetAll<Receipt>(this.tableName, params)
    }

    try {
      const query = this.buildQuery(params)
      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      return this.handleError(error, 'getAll')
    }
  }

  /**
   * 依收款單號查詢 (支援 Mock 模式)
   */
  async getById(receiptNumber: string): Promise<APIResponse<Receipt>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockGetById<Receipt>(this.tableName, receiptNumber)
    }
    return await super.getById(receiptNumber)
  }

  /**
   * 依訂單編號查詢收款單
   */
  async getByOrderNumber(orderNumber: string): Promise<APIResponse<Receipt[]>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allReceipts = mockDataManager.getTableData(this.tableName) as Receipt[]
        const filtered = allReceipts.filter(r => r.orderNumber === orderNumber)
        return {
          success: true,
          data: filtered
        }
      }

      const query = this.buildQuery({ orderNumber })
      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      return this.handleError(error, 'getByOrderNumber')
    }
  }

  /**
   * 依團號查詢收款單
   */
  async getByGroupCode(groupCode: string): Promise<APIResponse<Receipt[]>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allReceipts = mockDataManager.getTableData(this.tableName) as Receipt[]
        const filtered = allReceipts.filter(r => r.groupCode === groupCode)
        return {
          success: true,
          data: filtered
        }
      }

      const query = this.buildQuery({ groupCode })
      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      return this.handleError(error, 'getByGroupCode')
    }
  }

  /**
   * 新增收款單 (支援 Mock 模式)
   */
  async create(data: Omit<Receipt, 'receiptNumber' | 'created_at' | 'updated_at'>): Promise<APIResponse<Receipt>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockCreate<Receipt>(this.tableName, data)
    }
    return await super.create(data)
  }

  /**
   * 批量創建收款單
   */
  async batchCreate(data: BatchCreateReceiptRequest): Promise<APIResponse<Receipt[]>> {
    try {
      if (mockDataManager.isEnabled()) {
        const results: Receipt[] = []
        for (const receiptData of data.receipts) {
          const result = await mockDataManager.mockCreate<Receipt>(this.tableName, receiptData)
          if (result.success && result.data) {
            results.push(result.data)
          }
        }
        return {
          success: true,
          data: results
        }
      }

      // 實際批量創建邏輯
      const { supabase } = await import('@/lib/supabase/client')
      const { data: receipts, error } = await supabase
        .from(this.tableName)
        .insert(data.receipts)
        .select()

      if (error) throw error

      return {
        success: true,
        data: receipts || []
      }
    } catch (error) {
      return this.handleError(error, 'batchCreate')
    }
  }

  /**
   * 更新收款單 (支援 Mock 模式)
   */
  async update(receiptNumber: string, data: Partial<Receipt>): Promise<APIResponse<Receipt>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockUpdate<Receipt>(this.tableName, receiptNumber, data)
    }
    return await super.update(receiptNumber, data)
  }

  /**
   * 刪除收款單 (支援 Mock 模式)
   */
  async delete(receiptNumber: string): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDelete(this.tableName, receiptNumber)
    }
    return await super.delete(receiptNumber)
  }

  /**
   * 批量刪除收款單 (支援 Mock 模式)
   */
  async deleteMany(receiptNumbers: string[]): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDeleteMany(this.tableName, receiptNumbers)
    }
    return await super.deleteMany(receiptNumbers)
  }

  /**
   * 創建 LinkPay 付款連結
   */
  async createLinkPay(data: CreateLinkPayRequest): Promise<CreateLinkPayResponse> {
    try {
      // 這裡應該調用實際的 LinkPay API
      // 目前先模擬回應
      return {
        success: true,
        message: 'LinkPay 連結創建成功',
        data: {
          receiptNumber: data.receiptNumber,
          linkpayOrderNumber: `LP${Date.now()}`,
          price: 0, // 需要從收款單查詢
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後到期
          link: `https://linkpay.example.com/pay/${data.receiptNumber}`,
          status: 0, // 待付款
          paymentName: data.paymentName,
          createdAt: new Date(),
          createdBy: data.createUser,
          modifiedAt: new Date(),
          modifiedBy: data.createUser
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '創建 LinkPay 連結失敗'
      }
    }
  }

  /**
   * 取得收款單統計資料
   */
  async getStats(): Promise<APIResponse<ReceiptStats>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allReceipts = mockDataManager.getTableData(this.tableName) as Receipt[]
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const stats: ReceiptStats = {
          total: allReceipts.length,
          pending: allReceipts.filter(r => r.status === RECEIPT_STATUS.PENDING).length,
          confirmed: allReceipts.filter(r => r.status === RECEIPT_STATUS.CONFIRMED).length,
          error: allReceipts.filter(r => r.status === RECEIPT_STATUS.ABNORMAL).length,
          totalAmount: allReceipts.reduce((sum, r) => sum + (r.receiptAmount || 0), 0),
          thisMonth: allReceipts.filter(r =>
            new Date(r.createdAt) >= thisMonthStart
          ).length
        }

        return {
          success: true,
          data: stats
        }
      }

      // 實際資料庫查詢邏輯
      const { supabase } = await import('@/lib/supabase/client')
      const [totalResult, pendingResult, confirmedResult, errorResult, thisMonthResult] = await Promise.all([
        supabase.from(this.tableName).select('receipt_amount', { count: 'exact' }),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', RECEIPT_STATUS.PENDING),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', RECEIPT_STATUS.CONFIRMED),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }).eq('status', RECEIPT_STATUS.ABNORMAL),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      const total = totalResult.count || 0
      const totalAmount = totalResult.data?.reduce((sum, r) => sum + (r.receipt_amount || 0), 0) || 0
      const pending = pendingResult.count || 0
      const confirmed = confirmedResult.count || 0
      const error = errorResult.count || 0
      const thisMonth = thisMonthResult.count || 0

      const stats: ReceiptStats = {
        total,
        pending,
        confirmed,
        error,
        totalAmount,
        thisMonth
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return this.handleError(error, 'getStats')
    }
  }

  /**
   * 匯出收款單資料
   */
  async exportReceipts(params?: ReceiptQueryParams): Promise<APIResponse<Receipt[]>> {
    const response = await this.getAll(params)
    if (response.success) {
      return {
        ...response,
        message: '收款單匯出資料準備完成'
      }
    }
    return response
  }
}

export const receiptAPI = new ReceiptAPI()