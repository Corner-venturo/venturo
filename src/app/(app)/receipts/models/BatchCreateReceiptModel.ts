/**
 * VenturoERP 批量創建收款單資料模型
 * 完全移植自 cornerERP
 */

import { Receipt } from '@/types/receipt'

export type BatchCreateReceiptType = {
  orderNumber: string
  receiptDate: Date
  paymentMethod: string
  receiptItems: {
    receiptAmount: number
    receiptAccount: string
    note: string
    email: string
    payDateline: Date
    paymentName: string
  }[]
}

const BatchCreateReceiptModel = (data?: Partial<BatchCreateReceiptType>): BatchCreateReceiptType => {
  const defaults: BatchCreateReceiptType = {
    orderNumber: '',
    receiptDate: new Date(),
    paymentMethod: '',
    receiptItems: []
  }

  return { ...defaults, ...data }
}

export default BatchCreateReceiptModel