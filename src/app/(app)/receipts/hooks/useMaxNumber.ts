/**
 * Venturo ERP 編號生成 Hook
 * 替代 cornerERP 的 @/@max-numbers/maxNumberApi
 */

// 模擬編號生成服務
class MaxNumberService {
  static async getDbNumber(prefix: string, digits: number): Promise<string> {
    try {
      // 實際實現：調用 /api/max-numbers/generate
      const response = await fetch('/api/max-numbers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, digits })
      })
      if (!response.ok) throw new Error('Failed to generate number')
      const result = await response.json()
      return result.number
    } catch (error) {
      console.error('Failed to generate number:', error)
      // 暫時返回模擬編號
      const timestamp = Date.now().toString().slice(-4)
      return `${prefix}${timestamp.padStart(digits, '0')}`
    }
  }
}

// 編號生成函數 (相容 cornerERP 的 API)
export async function maxNumberGetDbNumber(prefix: string, digits: number): Promise<string> {
  return await MaxNumberService.getDbNumber(prefix, digits)
}