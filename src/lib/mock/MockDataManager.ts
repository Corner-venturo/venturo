/**
 * VenturoERP 2.0 Mock 資料管理系統
 * 設計目標：提供完整的 Mock 資料，讓原型開發與實際資料庫無縫切換
 */

import { APIResponse } from '../api/BaseBusinessAPI'

export interface MockConfig {
  enabled: boolean
  delay?: number // 模擬網路延遲
  errorRate?: number // 模擬錯誤率 (0-1)
}

export class MockDataManager {
  private static instance: MockDataManager
  private config: MockConfig = {
    enabled: true, // 預設開啟 Mock 模式
    delay: 200,
    errorRate: 0
  }

  private data: Map<string, any[]> = new Map()

  static getInstance(): MockDataManager {
    if (!MockDataManager.instance) {
      MockDataManager.instance = new MockDataManager()
    }
    return MockDataManager.instance
  }

  /**
   * 設定 Mock 配置
   */
  configure(config: Partial<MockConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 是否啟用 Mock 模式
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 設定表格的 Mock 資料
   */
  setTableData(tableName: string, data: any[]) {
    this.data.set(tableName, [...data])
  }

  /**
   * 取得表格的 Mock 資料
   */
  getTableData(tableName: string): any[] {
    return this.data.get(tableName) || []
  }

  /**
   * 模擬網路延遲
   */
  private async simulateDelay(): Promise<void> {
    if (this.config.delay && this.config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay))
    }
  }

  /**
   * 模擬隨機錯誤
   */
  private shouldSimulateError(): boolean {
    return Math.random() < (this.config.errorRate || 0)
  }

  /**
   * Mock API 查詢所有
   */
  async mockGetAll<T>(tableName: string, params?: any): Promise<APIResponse<T[]>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: [],
        error: 'Mock simulated error'
      }
    }

    let data = [...this.getTableData(tableName)]

    // 簡單的搜尋過濾
    if (params?.search) {
      data = data.filter((item: any) =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(params.search.toLowerCase())
        )
      )
    }

    // 排序
    if (params?.sortBy) {
      data.sort((a, b) => {
        const aVal = a[params.sortBy]
        const bVal = b[params.sortBy]
        const ascending = params.sortOrder !== 'desc'

        if (aVal < bVal) return ascending ? -1 : 1
        if (aVal > bVal) return ascending ? 1 : -1
        return 0
      })
    }

    // 分頁
    const total = data.length
    if (params?.offset || params?.limit) {
      const offset = params?.offset || 0
      const limit = params?.limit || 50
      data = data.slice(offset, offset + limit)
    }

    return {
      success: true,
      data,
      total
    }
  }

  /**
   * Mock API 依 ID 查詢
   */
  async mockGetById<T>(tableName: string, id: any, idField = 'id'): Promise<APIResponse<T>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: null as any,
        error: 'Mock simulated error'
      }
    }

    const data = this.getTableData(tableName)
    const item = data.find(item => item[idField] === id)

    if (!item) {
      return {
        success: false,
        data: null as any,
        error: 'Item not found'
      }
    }

    return {
      success: true,
      data: item
    }
  }

  /**
   * Mock API 新增
   */
  async mockCreate<T>(tableName: string, newData: any, idField = 'id'): Promise<APIResponse<T>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: null as any,
        error: 'Mock simulated error'
      }
    }

    const data = this.getTableData(tableName)
    const id = this.generateId(data, idField)

    const item = {
      ...newData,
      [idField]: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    data.push(item)
    this.setTableData(tableName, data)

    return {
      success: true,
      data: item,
      message: '新增成功'
    }
  }

  /**
   * Mock API 更新
   */
  async mockUpdate<T>(tableName: string, id: any, updateData: any, idField = 'id'): Promise<APIResponse<T>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: null as any,
        error: 'Mock simulated error'
      }
    }

    const data = this.getTableData(tableName)
    const index = data.findIndex(item => item[idField] === id)

    if (index === -1) {
      return {
        success: false,
        data: null as any,
        error: 'Item not found'
      }
    }

    const item = {
      ...data[index],
      ...updateData,
      updated_at: new Date().toISOString()
    }

    data[index] = item
    this.setTableData(tableName, data)

    return {
      success: true,
      data: item,
      message: '更新成功'
    }
  }

  /**
   * Mock API 刪除
   */
  async mockDelete(tableName: string, id: any, idField = 'id'): Promise<APIResponse<boolean>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: false,
        error: 'Mock simulated error'
      }
    }

    const data = this.getTableData(tableName)
    const index = data.findIndex(item => item[idField] === id)

    if (index === -1) {
      return {
        success: false,
        data: false,
        error: 'Item not found'
      }
    }

    data.splice(index, 1)
    this.setTableData(tableName, data)

    return {
      success: true,
      data: true,
      message: '刪除成功'
    }
  }

  /**
   * Mock API 批量刪除
   */
  async mockDeleteMany(tableName: string, ids: any[], idField = 'id'): Promise<APIResponse<boolean>> {
    await this.simulateDelay()

    if (this.shouldSimulateError()) {
      return {
        success: false,
        data: false,
        error: 'Mock simulated error'
      }
    }

    const data = this.getTableData(tableName)
    const filteredData = data.filter(item => !ids.includes(item[idField]))

    this.setTableData(tableName, filteredData)

    return {
      success: true,
      data: true,
      message: `成功刪除 ${ids.length} 筆記錄`
    }
  }

  /**
   * 產生 ID
   */
  private generateId(data: any[], idField: string): string {
    if (data.length === 0) return '1'

    const maxId = Math.max(...data.map(item => {
      const id = item[idField]
      return isNaN(Number(id)) ? 0 : Number(id)
    }))

    return String(maxId + 1)
  }

  /**
   * 清空所有 Mock 資料
   */
  clearAll() {
    this.data.clear()
  }

  /**
   * 從實際資料庫切換到 Mock 模式
   */
  enableMockMode() {
    this.config.enabled = true
  }

  /**
   * 從 Mock 模式切換到實際資料庫
   */
  disableMockMode() {
    this.config.enabled = false
  }
}

// 導出單例實例
export const mockDataManager = MockDataManager.getInstance()