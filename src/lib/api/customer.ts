/**
 * VenturoERP 2.0 顧客管理 API
 * 使用 BaseBusinessAPI + Mock 資料雙軌系統
 */

import { BaseBusinessAPI, APIResponse } from './BaseBusinessAPI'
import { mockDataManager } from '../mock/MockDataManager'
import { Customer, CustomerQueryParams, CustomerStats } from '@/types/customer'

class CustomerAPI extends BaseBusinessAPI<Customer, string, CustomerQueryParams> {
  protected tableName = 'customers'
  protected idField = 'id'

  /**
   * 覆寫搜尋過濾器，支援多欄位搜尋
   */
  protected applySearchFilter(query: any, search: string) {
    return query.or(`customer_name.ilike.%${search}%,customer_nickname.ilike.%${search}%,phone.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%`)
  }

  /**
   * 查詢所有顧客 (支援 Mock 模式)
   */
  async getAll(params?: CustomerQueryParams): Promise<APIResponse<Customer[]>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockGetAll<Customer>(this.tableName, params)
    }
    return await super.getAll(params)
  }

  /**
   * 依 ID 查詢顧客 (支援 Mock 模式)
   */
  async getById(id: string): Promise<APIResponse<Customer>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockGetById<Customer>(this.tableName, id)
    }
    return await super.getById(id)
  }

  /**
   * 新增顧客 (支援 Mock 模式)
   */
  async create(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<Customer>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockCreate<Customer>(this.tableName, data)
    }
    return await super.create(data)
  }

  /**
   * 更新顧客 (支援 Mock 模式)
   */
  async update(id: string, data: Partial<Customer>): Promise<APIResponse<Customer>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockUpdate<Customer>(this.tableName, id, data)
    }
    return await super.update(id, data)
  }

  /**
   * 刪除顧客 (支援 Mock 模式)
   */
  async delete(id: string): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDelete(this.tableName, id)
    }
    return await super.delete(id)
  }

  /**
   * 批量刪除顧客 (支援 Mock 模式)
   */
  async deleteMany(ids: string[]): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDeleteMany(this.tableName, ids)
    }
    return await super.deleteMany(ids)
  }

  /**
   * 取得顧客統計資料
   */
  async getStats(): Promise<APIResponse<CustomerStats>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allCustomers = mockDataManager.getTableData(this.tableName)
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const stats: CustomerStats = {
          total: allCustomers.length,
          active: allCustomers.filter((c: Customer) => c.is_active).length,
          inactive: allCustomers.filter((c: Customer) => !c.is_active).length,
          thisMonth: allCustomers.filter((c: Customer) =>
            new Date(c.created_at) >= thisMonthStart
          ).length
        }

        return {
          success: true,
          data: stats
        }
      }

      // 實際資料庫查詢邏輯
      const { supabase } = await import('@/lib/supabase/client')
      const [totalResult, activeResult, thisMonthResult] = await Promise.all([
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      const total = totalResult.count || 0
      const active = activeResult.count || 0
      const thisMonth = thisMonthResult.count || 0

      const stats: CustomerStats = {
        total,
        active,
        inactive: total - active,
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
   * 匯出顧客資料
   */
  async exportCustomers(params?: CustomerQueryParams): Promise<APIResponse<Customer[]>> {
    const response = await this.getAll(params)
    if (response.success) {
      return {
        ...response,
        message: '匯出資料準備完成'
      }
    }
    return response
  }
}

export const customerAPI = new CustomerAPI()