/**
 * VenturoERP 2.0 通用工具函數
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合併 Tailwind CSS 類名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化貨幣顯示
 */
export function formatCurrency(amount: number, currency = 'TWD'): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'NT$ 0'
  }

  const formatter = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currency === 'TWD' ? 'TWD' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  // 替換 TWD 為 NT$
  return formatter.format(amount).replace('TWD', 'NT$')
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: 'full' | 'date' | 'time' | 'datetime' = 'date'): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const options: Intl.DateTimeFormatOptions = {}

  switch (format) {
    case 'full':
      options.year = 'numeric'
      options.month = 'long'
      options.day = 'numeric'
      options.weekday = 'long'
      break
    case 'date':
      options.year = 'numeric'
      options.month = '2-digit'
      options.day = '2-digit'
      break
    case 'time':
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
    case 'datetime':
      options.year = 'numeric'
      options.month = '2-digit'
      options.day = '2-digit'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
  }

  return new Intl.DateTimeFormat('zh-TW', options).format(d)
}

/**
 * 計算兩個日期之間的天數
 */
export function daysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * 生成隨機 ID
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

/**
 * 深度複製物件
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }

  return obj
}

/**
 * 防抖函數
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 節流函數
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 檢查物件是否為空
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  if (typeof obj === 'string') return obj.trim().length === 0
  return false
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse<T = any>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * 驗證電子郵件格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 驗證電話號碼格式（台灣）
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+886|0)?[2-9]\d{7,8}$|^(\+886|0)?9\d{8}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * 截斷文字
 */
export function truncate(text: string, length: number, suffix = '...'): string {
  if (!text || text.length <= length) return text
  return text.substring(0, length) + suffix
}

/**
 * 首字母大寫
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 轉換為 URL slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}