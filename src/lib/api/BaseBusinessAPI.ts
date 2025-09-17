/**
 * VenturoERP 2.0 統一業務 API 架構
 * 設計目標：完美移植 cornerERP 的業務邏輯
 */

import { supabase } from '@/lib/supabase/client'

// 標準查詢參數介面
export interface StandardQueryParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// API 回應格式
export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
  total?: number
}

// CRUD 操作介面
export interface CRUDOperations<T, K, Q extends StandardQueryParams> {
  getAll(params?: Q): Promise<APIResponse<T[]>>
  getById(id: K): Promise<APIResponse<T>>
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<T>>
  update(id: K, data: Partial<T>): Promise<APIResponse<T>>
  delete(id: K): Promise<APIResponse<boolean>>
  deleteMany(ids: K[]): Promise<APIResponse<boolean>>
}

/**
 * 基礎業務 API 類別
 * 對應 cornerERP 的 BaseAPI 模式，但適配 VenturoERP 2.0 架構
 */
export abstract class BaseBusinessAPI<T, K, Q extends StandardQueryParams>
  implements CRUDOperations<T, K, Q> {

  protected abstract tableName: string
  protected abstract idField: string

  /**
   * 標準錯誤處理
   */
  protected handleError(error: any, operation: string): APIResponse<any> {
    console.error(`${this.tableName} ${operation} error:`, error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `${operation} 操作失敗`
    }
  }

  /**
   * 取得當前使用者
   */
  protected async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('User not authenticated')
    return user
  }

  /**
   * 建立查詢建構器
   */
  protected buildQuery(params?: Q) {
    let query = supabase.from(this.tableName).select('*')

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
    }

    if (params?.search) {
      // 子類別可以覆寫這個方法來定義搜尋邏輯
      query = this.applySearchFilter(query, params.search)
    }

    if (params?.sortBy) {
      query = query.order(params.sortBy, {
        ascending: params.sortOrder === 'asc'
      })
    }

    return query
  }

  /**
   * 套用搜尋過濾器 - 子類別可以覆寫
   */
  protected applySearchFilter(query: any, search: string) {
    return query
  }

  /**
   * 資料轉換 - 子類別可以覆寫
   */
  protected transformData(data: any): T {
    return data
  }

  /**
   * 查詢所有記錄
   */
  async getAll(params?: Q): Promise<APIResponse<T[]>> {
    try {
      const query = this.buildQuery(params)
      const { data, error, count } = await query

      if (error) throw error

      const transformedData = (data || []).map((item: any) => this.transformData(item))

      return {
        success: true,
        data: transformedData,
        total: count || data?.length || 0
      }
    } catch (error) {
      return this.handleError(error, 'getAll')
    }
  }

  /**
   * 依 ID 查詢
   */
  async getById(id: K): Promise<APIResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq(this.idField, id)
        .single()

      if (error) throw error

      return {
        success: true,
        data: this.transformData(data)
      }
    } catch (error) {
      return this.handleError(error, 'getById')
    }
  }

  /**
   * 新增記錄
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<T>> {
    try {
      const user = await this.getCurrentUser()

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: this.transformData(result),
        message: '新增成功'
      }
    } catch (error) {
      return this.handleError(error, 'create')
    }
  }

  /**
   * 更新記錄
   */
  async update(id: K, data: Partial<T>): Promise<APIResponse<T>> {
    try {
      const user = await this.getCurrentUser()

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_by: user.id
        })
        .eq(this.idField, id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: this.transformData(result),
        message: '更新成功'
      }
    } catch (error) {
      return this.handleError(error, 'update')
    }
  }

  /**
   * 刪除記錄
   */
  async delete(id: K): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq(this.idField, id)

      if (error) throw error

      return {
        success: true,
        data: true,
        message: '刪除成功'
      }
    } catch (error) {
      return this.handleError(error, 'delete')
    }
  }

  /**
   * 批量刪除
   */
  async deleteMany(ids: K[]): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in(this.idField, ids)

      if (error) throw error

      return {
        success: true,
        data: true,
        message: `成功刪除 ${ids.length} 筆記錄`
      }
    } catch (error) {
      return this.handleError(error, 'deleteMany')
    }
  }

  /**
   * 特殊查詢方法 - 依外鍵關聯查詢
   */
  async getByRelation(field: string, value: any, params?: Q): Promise<APIResponse<T[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq(field, value)

      if (params?.limit) query = query.limit(params.limit)
      if (params?.sortBy) {
        query = query.order(params.sortBy, {
          ascending: params.sortOrder === 'asc'
        })
      }

      const { data, error } = await query

      if (error) throw error

      const transformedData = (data || []).map((item: any) => this.transformData(item))

      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      return this.handleError(error, 'getByRelation')
    }
  }

  /**
   * 取得選擇列表 (for-select) - 對應 cornerERP 的選擇功能
   */
  async getForSelect(valueField?: string, labelField?: string): Promise<APIResponse<{value: any, label: string}[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`${valueField || this.idField}, ${labelField || 'name'}`)
        .eq('is_active', true)
        .order(labelField || 'name')

      if (error) throw error

      const options = (data || []).map((item: any) => ({
        value: item[valueField || this.idField],
        label: item[labelField || 'name']
      }))

      return {
        success: true,
        data: options
      }
    } catch (error) {
      return this.handleError(error, 'getForSelect')
    }
  }
}