/**
 * VenturoERP 2.0 顧客管理架構測試
 * 驗證 Mock 資料系統和 API 架構的可行性
 */

import { customerAPI } from '@/lib/api/customer'
import { mockDataManager } from '@/lib/mock/MockDataManager'
import { initializeCustomerMockData } from '@/lib/mock/customerData'

export class CustomerArchitectureTest {
  static async runTests(): Promise<{ success: boolean; results: string[] }> {
    const results: string[] = []
    let allTestsPassed = true

    try {
      // 確保使用 Mock 模式
      mockDataManager.enableMockMode()
      initializeCustomerMockData()

      results.push('✅ Mock 模式已啟用')

      // 測試 1: 查詢所有顧客
      const allCustomersResponse = await customerAPI.getAll()
      if (allCustomersResponse.success && allCustomersResponse.data.length > 0) {
        results.push(`✅ 查詢所有顧客: ${allCustomersResponse.data.length} 筆記錄`)
      } else {
        results.push('❌ 查詢所有顧客失敗')
        allTestsPassed = false
      }

      // 測試 2: 依 ID 查詢顧客
      const customerResponse = await customerAPI.getById('1')
      if (customerResponse.success && customerResponse.data) {
        results.push(`✅ 依 ID 查詢顧客: ${customerResponse.data.customer_name}`)
      } else {
        results.push('❌ 依 ID 查詢顧客失敗')
        allTestsPassed = false
      }

      // 測試 3: 搜尋功能
      const searchResponse = await customerAPI.getAll({ search: '王大明' })
      if (searchResponse.success && searchResponse.data.length > 0) {
        results.push(`✅ 搜尋功能: 找到 ${searchResponse.data.length} 筆符合記錄`)
      } else {
        results.push('❌ 搜尋功能失敗')
        allTestsPassed = false
      }

      // 測試 4: 新增顧客
      const newCustomer = {
        customer_name: '測試顧客',
        customer_nickname: '測試',
        gender: 'M' as const,
        mobile: '0987654321',
        email: 'test@example.com',
        is_active: true
      }

      const createResponse = await customerAPI.create(newCustomer)
      if (createResponse.success && createResponse.data) {
        results.push(`✅ 新增顧客: ${createResponse.data.customer_name}`)

        // 測試 5: 更新顧客
        const updateResponse = await customerAPI.update(createResponse.data.id, {
          customer_nickname: '測試更新'
        })

        if (updateResponse.success) {
          results.push('✅ 更新顧客成功')
        } else {
          results.push('❌ 更新顧客失敗')
          allTestsPassed = false
        }

        // 測試 6: 刪除顧客
        const deleteResponse = await customerAPI.delete(createResponse.data.id)
        if (deleteResponse.success) {
          results.push('✅ 刪除顧客成功')
        } else {
          results.push('❌ 刪除顧客失敗')
          allTestsPassed = false
        }
      } else {
        results.push('❌ 新增顧客失敗')
        allTestsPassed = false
      }

      // 測試 7: 統計資料
      const statsResponse = await customerAPI.getStats()
      if (statsResponse.success && statsResponse.data) {
        results.push(`✅ 統計資料: 總計 ${statsResponse.data.total} 筆，活躍 ${statsResponse.data.active} 筆`)
      } else {
        results.push('❌ 取得統計資料失敗')
        allTestsPassed = false
      }

      // 測試 8: 批量操作
      const batchDeleteResponse = await customerAPI.deleteMany(['999', '998'])
      if (batchDeleteResponse.success) {
        results.push('✅ 批量刪除功能正常 (測試不存在的 ID)')
      } else {
        results.push('❌ 批量刪除功能失敗')
        allTestsPassed = false
      }

      // 測試 9: 排序功能
      const sortedResponse = await customerAPI.getAll({
        sortBy: 'customer_name',
        sortOrder: 'asc'
      })
      if (sortedResponse.success && sortedResponse.data.length > 1) {
        const first = sortedResponse.data[0].customer_name
        const second = sortedResponse.data[1].customer_name
        if (first <= second) {
          results.push('✅ 排序功能正常')
        } else {
          results.push('❌ 排序功能異常')
          allTestsPassed = false
        }
      }

      // 測試 10: 分頁功能
      const pageResponse = await customerAPI.getAll({
        limit: 2,
        offset: 0
      })
      if (pageResponse.success && pageResponse.data.length <= 2) {
        results.push('✅ 分頁功能正常')
      } else {
        results.push('❌ 分頁功能異常')
        allTestsPassed = false
      }

    } catch (error) {
      results.push(`❌ 測試執行錯誤: ${error}`)
      allTestsPassed = false
    }

    return {
      success: allTestsPassed,
      results
    }
  }
}

// 在瀏覽器控制台中可用的測試函數
if (typeof window !== 'undefined') {
  (window as any).testCustomerArchitecture = async () => {
    const { success, results } = await CustomerArchitectureTest.runTests()

    console.group('🧪 VenturoERP 2.0 顧客管理架構測試')
    console.log(`整體結果: ${success ? '✅ 通過' : '❌ 失敗'}`)
    console.log('詳細結果:')
    results.forEach(result => console.log(result))
    console.groupEnd()

    return { success, results }
  }
}