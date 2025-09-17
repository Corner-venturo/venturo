/**
 * VenturoERP 收款單 Mock 資料
 * 用於開發和測試階段
 */

import { Receipt, LinkPayLog } from '@/types/receipt'
import { RECEIPT_STATUS } from '@/constants/receiptStatus'
import { RECEIPT_TYPES } from '@/constants/receiptTypes'

// LinkPay Mock 資料
const mockLinkPayLogs: LinkPayLog[] = [
  {
    receiptNumber: 'RC2024001',
    linkpayOrderNumber: 'LP2024001001',
    price: 50000,
    endDate: new Date('2024-12-31'),
    link: 'https://linkpay.example.com/pay/LP2024001001',
    status: 0, // 待付款
    paymentName: '王小明',
    createdAt: new Date('2024-01-15'),
    createdBy: 'user001',
    modifiedAt: new Date('2024-01-15'),
    modifiedBy: 'user001'
  },
  {
    receiptNumber: 'RC2024002',
    linkpayOrderNumber: 'LP2024002001',
    price: 75000,
    endDate: new Date('2024-12-25'),
    link: 'https://linkpay.example.com/pay/LP2024002001',
    status: 1, // 已付款
    paymentName: '李小華',
    createdAt: new Date('2024-01-20'),
    createdBy: 'user002',
    modifiedAt: new Date('2024-01-22'),
    modifiedBy: 'user002'
  }
]

// 收款單 Mock 資料
export const mockReceipts: Receipt[] = [
  {
    receiptNumber: 'RC2024001',
    orderNumber: 'ORD2024001',
    receiptDate: new Date('2024-01-15'),
    receiptAmount: 50000,
    actualAmount: 50000,
    receiptType: RECEIPT_TYPES.LINK_PAY,
    receiptAccount: 'LINKPAY001',
    payDateline: new Date('2024-12-31'),
    email: 'wang@example.com',
    note: '日本櫻花團第一期款項',
    status: RECEIPT_STATUS.PENDING,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user001',
    modifiedAt: new Date('2024-01-15'),
    modifiedBy: 'user001',
    groupCode: 'JP2024SPRING',
    groupName: '2024春季日本櫻花團',
    linkpay: [mockLinkPayLogs[0]]
  },
  {
    receiptNumber: 'RC2024002',
    orderNumber: 'ORD2024002',
    receiptDate: new Date('2024-01-20'),
    receiptAmount: 75000,
    actualAmount: 75000,
    receiptType: RECEIPT_TYPES.LINK_PAY,
    receiptAccount: 'LINKPAY002',
    payDateline: new Date('2024-12-25'),
    email: 'lee@example.com',
    note: '韓國首爾團第一期款項',
    status: RECEIPT_STATUS.CONFIRMED,
    createdAt: new Date('2024-01-20'),
    createdBy: 'user002',
    modifiedAt: new Date('2024-01-22'),
    modifiedBy: 'user002',
    groupCode: 'KR2024WINTER',
    groupName: '2024冬季韓國首爾團',
    linkpay: [mockLinkPayLogs[1]]
  },
  {
    receiptNumber: 'RC2024003',
    orderNumber: 'ORD2024003',
    receiptDate: new Date('2024-01-25'),
    receiptAmount: 30000,
    actualAmount: 30000,
    receiptType: RECEIPT_TYPES.BANK_TRANSFER,
    receiptAccount: '台北富邦 123456789',
    payDateline: new Date('2024-02-15'),
    email: 'chen@example.com',
    note: '台灣環島團訂金',
    status: RECEIPT_STATUS.CONFIRMED,
    createdAt: new Date('2024-01-25'),
    createdBy: 'user003',
    modifiedAt: new Date('2024-01-26'),
    modifiedBy: 'user003',
    groupCode: 'TW2024ROUND',
    groupName: '2024台灣環島深度團',
    linkpay: []
  },
  {
    receiptNumber: 'RC2024004',
    orderNumber: 'ORD2024004',
    receiptDate: new Date('2024-02-01'),
    receiptAmount: 60000,
    actualAmount: 0,
    receiptType: RECEIPT_TYPES.CREDIT_CARD,
    receiptAccount: '信用卡刷卡',
    payDateline: new Date('2024-02-28'),
    email: 'zhang@example.com',
    note: '泰國曼谷團第二期款項',
    status: RECEIPT_STATUS.ABNORMAL,
    createdAt: new Date('2024-02-01'),
    createdBy: 'user004',
    modifiedAt: new Date('2024-02-05'),
    modifiedBy: 'user004',
    groupCode: 'TH2024BANGKOK',
    groupName: '2024泰國曼谷美食團',
    linkpay: []
  },
  {
    receiptNumber: 'RC2024005',
    orderNumber: 'ORD2024005',
    receiptDate: new Date('2024-02-10'),
    receiptAmount: 45000,
    actualAmount: 45000,
    receiptType: RECEIPT_TYPES.CASH,
    receiptAccount: '現金收款',
    payDateline: new Date('2024-03-10'),
    email: 'liu@example.com',
    note: '新加坡團尾款',
    status: RECEIPT_STATUS.CONFIRMED,
    createdAt: new Date('2024-02-10'),
    createdBy: 'user005',
    modifiedAt: new Date('2024-02-10'),
    modifiedBy: 'user005',
    groupCode: 'SG2024CITY',
    groupName: '2024新加坡城市探索團',
    linkpay: []
  },
  {
    receiptNumber: 'RC2024006',
    orderNumber: 'ORD2024006',
    receiptDate: new Date('2024-02-15'),
    receiptAmount: 80000,
    actualAmount: 40000,
    receiptType: RECEIPT_TYPES.CHECK,
    receiptAccount: '支票 No.123456',
    payDateline: new Date('2024-03-15'),
    email: 'wu@example.com',
    note: '歐洲深度團第一期款項',
    status: RECEIPT_STATUS.PENDING,
    createdAt: new Date('2024-02-15'),
    createdBy: 'user006',
    modifiedAt: new Date('2024-02-15'),
    modifiedBy: 'user006',
    groupCode: 'EU2024DEEP',
    groupName: '2024歐洲深度文化團',
    linkpay: []
  }
]

/**
 * 初始化收款單 Mock 資料
 */
export function initializeReceiptMockData() {
  const { mockDataManager } = require('./MockDataManager')

  // 設置收款單資料
  mockDataManager.setTableData('receipts', mockReceipts)

  console.log('✅ 收款單 Mock 資料已初始化', {
    receipts: mockReceipts.length,
    linkPayLogs: mockLinkPayLogs.length
  })
}

/**
 * 根據條件過濾收款單
 */
export function filterReceipts(filters: {
  receiptNumber?: string
  orderNumber?: string
  groupCode?: string
  status?: number[]
  receiptType?: number
  dateFrom?: string
  dateTo?: string
}): Receipt[] {
  let filtered = [...mockReceipts]

  if (filters.receiptNumber) {
    filtered = filtered.filter(r =>
      r.receiptNumber.toLowerCase().includes(filters.receiptNumber!.toLowerCase())
    )
  }

  if (filters.orderNumber) {
    filtered = filtered.filter(r =>
      r.orderNumber.toLowerCase().includes(filters.orderNumber!.toLowerCase())
    )
  }

  if (filters.groupCode) {
    filtered = filtered.filter(r =>
      r.groupCode?.toLowerCase().includes(filters.groupCode!.toLowerCase())
    )
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(r => filters.status!.includes(r.status))
  }

  if (filters.receiptType !== undefined) {
    filtered = filtered.filter(r => r.receiptType === filters.receiptType)
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(r => r.receiptDate >= new Date(filters.dateFrom!))
  }

  if (filters.dateTo) {
    filtered = filtered.filter(r => r.receiptDate <= new Date(filters.dateTo!))
  }

  return filtered
}

/**
 * 生成新的收款單編號
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const existingNumbers = mockReceipts
    .map(r => r.receiptNumber)
    .filter(num => num.startsWith(`RC${year}`))
    .map(num => parseInt(num.slice(-3)))
    .sort((a, b) => b - a)

  const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1
  return `RC${year}${nextNumber.toString().padStart(3, '0')}`
}