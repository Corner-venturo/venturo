/**
 * LinkPay 狀態常數
 */
export const LINKPAY_STATUS = {
  PENDING: 0,   // 待付款
  PAID: 1,      // 已付款
  EXPIRED: 2,   // 已過期
  CANCELLED: 3  // 已取消
} as const

/**
 * LinkPay 狀態名稱映射
 */
export const LINKPAY_STATUS_NAMES: Record<number, string> = {
  [LINKPAY_STATUS.PENDING]: '待付款',
  [LINKPAY_STATUS.PAID]: '已付款',
  [LINKPAY_STATUS.EXPIRED]: '已過期',
  [LINKPAY_STATUS.CANCELLED]: '已取消'
}

/**
 * LinkPay 狀態選項 (用於下拉選單)
 */
export const LINKPAY_STATUS_OPTIONS = Object.entries(LINKPAY_STATUS_NAMES).map(([value, label]) => ({
  value: Number(value),
  label
}))

/**
 * 根據 LinkPay 狀態代碼獲取對應的名稱
 * @param status LinkPay 狀態代碼
 * @returns LinkPay 狀態名稱
 */
export function getLinkPayStatusName(status: number | undefined | null): string {
  if (status === undefined || status === null) {
    return ''
  }

  return LINKPAY_STATUS_NAMES[status] || `未知狀態(${status})`
}

/**
 * LinkPay 狀態類型
 */
export type LinkPayStatus = (typeof LINKPAY_STATUS)[keyof typeof LINKPAY_STATUS]

/**
 * LinkPay 狀態顏色映射
 */
export const LINKPAY_STATUS_COLORS: Record<
  number,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [LINKPAY_STATUS.PENDING]: 'warning',    // 待付款 - 黃色警告色
  [LINKPAY_STATUS.PAID]: 'success',       // 已付款 - 綠色成功色
  [LINKPAY_STATUS.EXPIRED]: 'error',      // 已過期 - 紅色錯誤色
  [LINKPAY_STATUS.CANCELLED]: 'default'   // 已取消 - 灰色預設色
}

/**
 * 根據 LinkPay 狀態代碼獲取對應的顏色
 * @param status LinkPay 狀態代碼
 * @returns LinkPay 狀態顏色
 */
export function getLinkPayStatusColor(
  status: number | undefined | null
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  if (status === undefined || status === null) {
    return 'default'
  }

  return LINKPAY_STATUS_COLORS[status] || 'default'
}