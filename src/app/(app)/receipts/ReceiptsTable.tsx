'use client'

import { useMemo, useState, useEffect } from 'react'
import { receiptAPI } from '@/lib/api/receipt'
import { Receipt, ReceiptQueryParams } from '@/types/receipt'
import { getReceiptTypeName } from '@/constants/receiptTypes'
import { RECEIPT_STATUS } from '@/constants/receiptStatus'
import { Button } from '@/components/catalyst/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Badge } from '@/components/catalyst/badge'
import { Link } from '@/components/catalyst/link'
import { MagnifyingGlassIcon, DocumentArrowDownIcon } from '@heroicons/react/16/solid'
import ReceiptSearchDialog from './components/ReceiptSearchDialog'
import { format } from 'date-fns'
import ExcelJS from 'exceljs'

const STORAGE_KEY = 'receiptSearchParams'

// 狀態顏色映射
const getStatusBadgeColor = (status: number) => {
  switch (status) {
    case RECEIPT_STATUS.PENDING:
      return 'yellow'
    case RECEIPT_STATUS.CONFIRMED:
      return 'green'
    case RECEIPT_STATUS.ABNORMAL:
      return 'red'
    default:
      return 'zinc'
  }
}

// 狀態名稱映射
const getStatusName = (status: number) => {
  switch (status) {
    case RECEIPT_STATUS.PENDING:
      return '待確認'
    case RECEIPT_STATUS.CONFIRMED:
      return '已確認'
    case RECEIPT_STATUS.ABNORMAL:
      return '付款異常'
    default:
      return '未知'
  }
}

export default function ReceiptsTable() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<ReceiptQueryParams>(() => {
    // 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
    if (typeof window !== 'undefined') {
      const savedParams = localStorage.getItem(STORAGE_KEY)
      return savedParams
        ? JSON.parse(savedParams)
        : {
            status: [RECEIPT_STATUS.PENDING],
            limit: 200
          }
    }
    return {
      status: [RECEIPT_STATUS.PENDING],
      limit: 200
    }
  })

  // 載入收款單資料
  const loadReceipts = async (params: ReceiptQueryParams) => {
    try {
      setIsLoading(true)
      const response = await receiptAPI.getAll(params)
      if (response.success && response.data) {
        setReceipts(response.data)
      } else {
        console.error('載入收款單失敗:', response.message)
        setReceipts([])
      }
    } catch (error) {
      console.error('載入收款單發生錯誤:', error)
      setReceipts([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    loadReceipts(searchParams)
  }, [])

  // 當搜尋參數改變時，保存到 localStorage 並重新載入資料
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams))
    }
    loadReceipts(searchParams)
  }, [searchParams])

  // 處理搜尋
  const handleSearch = (newParams: ReceiptQueryParams) => {
    setSearchParams(newParams)
  }

  // 匯出Excel功能
  const handleExportExcel = (data: Receipt[]) => {
    // 準備匯出數據
    const exportData = data.map((item) => ({
      收款單號: item.receiptNumber,
      團號: item.groupCode || '-',
      團名: item.groupName || '-',
      訂單編號: item.orderNumber,
      收款日期: format(new Date(item.receiptDate), 'yyyy-MM-dd'),
      金額: item.receiptAmount.toLocaleString(),
      收款方式: getReceiptTypeName(item.receiptType),
      狀態: getStatusName(item.status),
      收款帳戶: item.receiptAccount || '-',
      備註: item.note || '-'
    }))

    // 創建工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('收款單列表')

    // 添加標題行
    const headers = ['收款編號', '團號', '團名', '訂單編號', '收款日期', '金額', '收款方式', '狀態', '收款帳戶', '備註']
    worksheet.addRow(headers)

    // 添加數據行
    exportData.forEach(row => {
      worksheet.addRow([
        row.收款單號,
        row.團號,
        row.團名,
        row.訂單編號,
        row.收款日期,
        row.金額,
        row.收款方式,
        row.狀態,
        row.收款帳戶,
        row.備註
      ])
    })

    // 設置標題行樣式
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // 自動調整欄寬
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1)
      column.width = Math.max(header.length, 12)
    })

    // 生成帶有日期的檔名
    const fileName = `${format(new Date(), 'yyyy_MM_dd')}_收款單列表.xlsx`

    // 匯出Excel文件
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 工具列 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            color="indigo"
            onClick={() => setSearchDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden sm:inline">詳細搜尋</span>
          </Button>
          <Button
            color="zinc"
            onClick={() => handleExportExcel(receipts)}
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span className="hidden sm:inline">匯出Excel</span>
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          共 {receipts.length} 筆資料
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>收款單號</TableHeader>
              <TableHeader>團號</TableHeader>
              <TableHeader>團名</TableHeader>
              <TableHeader>訂單編號</TableHeader>
              <TableHeader>收款日期</TableHeader>
              <TableHeader>金額</TableHeader>
              <TableHeader>收款方式</TableHeader>
              <TableHeader>狀態</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  沒有找到符合條件的收款單
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.receiptNumber}>
                  <TableCell>
                    <Link
                      href={`/receipts/${receipt.receiptNumber}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {receipt.receiptNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {receipt.groupCode ? (
                      <Link
                        href={`/groups/${receipt.groupCode}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {receipt.groupCode}
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span>{receipt.groupName || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/receipts/by-order/${receipt.orderNumber}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {receipt.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {format(new Date(receipt.receiptDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {receipt.receiptAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getReceiptTypeName(receipt.receiptType)}
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusBadgeColor(receipt.status) as any}>
                      {getStatusName(receipt.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 搜尋對話框 */}
      <ReceiptSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSearch={handleSearch}
        initialParams={searchParams}
      />
    </div>
  )
}