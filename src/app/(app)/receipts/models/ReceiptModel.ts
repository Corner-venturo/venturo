/**
 * VenturoERP 收款單資料模型
 * 完全移植自 cornerERP
 */

import { Receipt } from '@/types/receipt'
import { RECEIPT_STATUS } from '@/constants/receiptStatus'

const ReceiptModel = (data: Partial<Receipt>): Receipt => {
  const defaults: Receipt = {
    receiptNumber: '',           // 收款單號
    orderNumber: '',             // 訂單編號
    receiptDate: new Date(),     // 收款日期
    receiptAmount: 0,            // 收款金額
    actualAmount: 0,             // 實收金額
    receiptType: 0,              // 付款方式 (預設匯款)
    receiptAccount: '',          // 收款帳號
    email: '',                   // 收款Email
    payDateline: new Date(),     // 付款截止日
    note: '',                    // 備註
    status: RECEIPT_STATUS.PENDING, // 狀態 (預設待確認)
    createdAt: new Date(),       // 創建日期
    createdBy: '',               // 創建人員
    modifiedAt: new Date(),      // 修改日期
    modifiedBy: '',              // 修改人員
    groupCode: '',               // 團號
    groupName: '',               // 團名
    linkpay: []                  // LinkPay 資訊
  }

  // 過濾只保留有效的欄位
  const validFields = Object.keys(defaults)
  const filteredData: Partial<Receipt> = {}

  validFields.forEach(key => {
    if (key in data && data[key as keyof Receipt] !== undefined) {
      ;(filteredData as any)[key] = data[key as keyof Receipt]
    }
  })

  // 合併預設值
  return { ...defaults, ...filteredData }
}

export default ReceiptModel