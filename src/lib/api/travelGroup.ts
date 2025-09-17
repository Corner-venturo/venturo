/**
 * VenturoERP 2.0 旅遊團管理 API
 * 使用 BaseBusinessAPI + Mock 資料雙軌系統
 */

import { BaseBusinessAPI, APIResponse } from './BaseBusinessAPI'
import { mockDataManager } from '../mock/MockDataManager'
import { TravelGroup, TravelGroupQueryParams, TravelGroupStats, TravelGroupStatus } from '@/types/travelGroup'

class TravelGroupAPI extends BaseBusinessAPI<TravelGroup, string, TravelGroupQueryParams> {
  protected tableName = 'travel_groups'
  protected idField = 'id'

  /**
   * 覆寫搜尋過濾器，支援多欄位搜尋
   */
  protected applySearchFilter(query: any, search: string) {
    return query.or(`group_name.ilike.%${search}%,group_code.ilike.%${search}%,destination.ilike.%${search}%,description.ilike.%${search}%`)
  }

  /**
   * 查詢所有旅遊團 (支援 Mock 模式)
   */
  async getAll(params?: TravelGroupQueryParams): Promise<APIResponse<TravelGroup[]>> {
    if (mockDataManager.isEnabled()) {
      let mockParams = { ...params }

      // 處理額外的過濾條件
      if (params?.status || params?.departure_date_from || params?.departure_date_to) {
        const allData = mockDataManager.getTableData(this.tableName)
        let filteredData = allData

        if (params.status) {
          filteredData = filteredData.filter((item: TravelGroup) => item.status === params.status)
        }

        if (params.departure_date_from) {
          filteredData = filteredData.filter((item: TravelGroup) =>
            new Date(item.departure_date) >= new Date(params.departure_date_from!)
          )
        }

        if (params.departure_date_to) {
          filteredData = filteredData.filter((item: TravelGroup) =>
            new Date(item.departure_date) <= new Date(params.departure_date_to!)
          )
        }

        // 臨時替換資料
        mockDataManager.setTableData(this.tableName, filteredData)
        const result = await mockDataManager.mockGetAll<TravelGroup>(this.tableName, mockParams)
        // 恢復原始資料
        mockDataManager.setTableData(this.tableName, allData)

        return result
      }

      return await mockDataManager.mockGetAll<TravelGroup>(this.tableName, mockParams)
    }
    return await super.getAll(params)
  }

  /**
   * 依 ID 查詢旅遊團 (支援 Mock 模式)
   */
  async getById(id: string): Promise<APIResponse<TravelGroup>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockGetById<TravelGroup>(this.tableName, id)
    }
    return await super.getById(id)
  }

  /**
   * 新增旅遊團 (支援 Mock 模式)
   */
  async create(data: Omit<TravelGroup, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<TravelGroup>> {
    if (mockDataManager.isEnabled()) {
      // 自動生成團號
      if (!data.group_code) {
        const allGroups = mockDataManager.getTableData(this.tableName)
        const codeNumber = String(allGroups.length + 1).padStart(3, '0')
        const destination = data.destination.slice(0, 2)
        const year = new Date().getFullYear().toString().slice(2)
        data.group_code = `${destination}${year}${codeNumber}`
      }

      return await mockDataManager.mockCreate<TravelGroup>(this.tableName, data)
    }
    return await super.create(data)
  }

  /**
   * 更新旅遊團 (支援 Mock 模式)
   */
  async update(id: string, data: Partial<TravelGroup>): Promise<APIResponse<TravelGroup>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockUpdate<TravelGroup>(this.tableName, id, data)
    }
    return await super.update(id, data)
  }

  /**
   * 刪除旅遊團 (支援 Mock 模式)
   */
  async delete(id: string): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDelete(this.tableName, id)
    }
    return await super.delete(id)
  }

  /**
   * 批量刪除旅遊團 (支援 Mock 模式)
   */
  async deleteMany(ids: string[]): Promise<APIResponse<boolean>> {
    if (mockDataManager.isEnabled()) {
      return await mockDataManager.mockDeleteMany(this.tableName, ids)
    }
    return await super.deleteMany(ids)
  }

  /**
   * 取得旅遊團統計資料
   */
  async getStats(): Promise<APIResponse<TravelGroupStats>> {
    try {
      if (mockDataManager.isEnabled()) {
        const allGroups = mockDataManager.getTableData(this.tableName) as TravelGroup[]
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const stats: TravelGroupStats = {
          total: allGroups.length,
          planning: allGroups.filter(g => g.status === 'planning').length,
          confirmed: allGroups.filter(g => g.status === 'confirmed').length,
          in_progress: allGroups.filter(g => g.status === 'in_progress').length,
          completed: allGroups.filter(g => g.status === 'completed').length,
          cancelled: allGroups.filter(g => g.status === 'cancelled').length,
          thisMonth: allGroups.filter(g =>
            new Date(g.created_at) >= thisMonthStart
          ).length,
          totalRevenue: allGroups
            .filter(g => g.status === 'completed')
            .reduce((sum, g) => sum + (g.price_per_person * g.current_participants), 0),
          averagePrice: allGroups.length > 0
            ? allGroups.reduce((sum, g) => sum + g.price_per_person, 0) / allGroups.length
            : 0
        }

        return {
          success: true,
          data: stats
        }
      }

      // 實際資料庫查詢邏輯
      const { supabase } = await import('@/lib/supabase/client')
      const [totalResult, statusResults, thisMonthResult] = await Promise.all([
        supabase.from(this.tableName).select('*', { count: 'exact', head: true }),
        supabase.from(this.tableName).select('status, price_per_person, current_participants'),
        supabase.from(this.tableName).select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      const total = totalResult.count || 0
      const statusData = statusResults.data || []
      const thisMonth = thisMonthResult.count || 0

      const statusCounts = statusData.reduce((acc: Record<TravelGroupStatus, number>, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {
        planning: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      })

      const totalRevenue = statusData
        .filter((item: any) => item.status === 'completed')
        .reduce((sum: number, item: any) => sum + (item.price_per_person * item.current_participants), 0)

      const averagePrice = statusData.length > 0
        ? statusData.reduce((sum: number, item: any) => sum + item.price_per_person, 0) / statusData.length
        : 0

      const stats: TravelGroupStats = {
        total,
        ...statusCounts,
        thisMonth,
        totalRevenue,
        averagePrice
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
   * 更新旅遊團狀態
   */
  async updateStatus(id: string, status: TravelGroupStatus): Promise<APIResponse<TravelGroup>> {
    return await this.update(id, { status })
  }

  /**
   * 依目的地查詢
   */
  async getByDestination(destination: string, params?: TravelGroupQueryParams): Promise<APIResponse<TravelGroup[]>> {
    return await this.getByRelation('destination', destination, params)
  }

  /**
   * 依日期範圍查詢
   */
  async getByDateRange(startDate: string, endDate: string): Promise<APIResponse<TravelGroup[]>> {
    if (mockDataManager.isEnabled()) {
      const allGroups = mockDataManager.getTableData(this.tableName) as TravelGroup[]
      const filteredGroups = allGroups.filter(group => {
        const departureDate = new Date(group.departure_date)
        return departureDate >= new Date(startDate) && departureDate <= new Date(endDate)
      })

      return {
        success: true,
        data: filteredGroups
      }
    }

    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('departure_date', startDate)
        .lte('departure_date', endDate)
        .order('departure_date')

      if (error) throw error

      return {
        success: true,
        data: (data || []).map((item: any) => this.transformData(item))
      }
    } catch (error) {
      return this.handleError(error, 'getByDateRange')
    }
  }
}

export const travelGroupAPI = new TravelGroupAPI()