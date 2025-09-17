'use client'

import { useState } from 'react'
import { Receipt, LinkPayLog } from '@/types/receipt'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import {
  DocumentDuplicateIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/16/solid'
import { format } from 'date-fns'
import { LINKPAY_STATUS, getLinkPayStatusName, getLinkPayStatusColor } from '@/constants/linkPayStatus'

// 映射 LinkPay 狀態顏色到 Badge 顏色
const mapLinkPayColorToBadgeColor = (linkPayColor: string): 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'zinc' => {
  switch (linkPayColor) {
    case 'success': return 'green'
    case 'error': return 'red'
    case 'warning': return 'yellow'
    case 'info': return 'blue'
    case 'primary': return 'blue'
    case 'secondary': return 'zinc'
    default: return 'zinc'
  }
}

interface LinkPayExpandableRowProps {
  receipt: Receipt
  linkpayData: LinkPayLog[]
  paymentName: string
  open: boolean
  onToggle: () => void
  onLinkPayCreated?: () => void
}

export default function LinkPayExpandableRow({
  receipt,
  linkpayData,
  paymentName,
  open,
  onToggle,
  onLinkPayCreated
}: LinkPayExpandableRowProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      // 這裡可以顯示一個成功訊息
      console.log('連結已複製到剪貼簿')
    } catch (error) {
      console.error('複製連結失敗:', error)
    }
  }

  // 檢查是否有待付款或已付款的 LinkPay
  const hasPendingOrPaidLinkPay = linkpayData.some(
    (item) => item.status === LINKPAY_STATUS.PENDING || item.status === LINKPAY_STATUS.PAID
  )

  // 檢查是否可以新增 LinkPay
  const canCreateLinkPay = !hasPendingOrPaidLinkPay && receipt.status === 0 // 假設 0 是待付款狀態

  // 處理新增 LinkPay
  const handleCreateClick = async () => {
    setIsCreating(true)
    try {
      // 這裡調用 LinkPay 創建 API
      // const result = await createLinkPayAPI(receipt.receiptNumber, ...)
      console.log('創建 LinkPay:', receipt.receiptNumber)

      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (onLinkPayCreated) {
        onLinkPayCreated()
      }
    } catch (error) {
      console.error('創建 LinkPay 失敗:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {/* 展開/收縮按鈕行 */}
      <TableRow>
        <TableCell colSpan={8}>
          <div className="flex items-center justify-between py-2">
            <Button
              plain
              onClick={onToggle}
              className="flex items-center gap-2 text-sm"
            >
              {open ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              <span>LinkPay 付款資訊</span>
              {linkpayData.length > 0 && (
                <Badge color="blue" className="text-xs">
                  {linkpayData.length}
                </Badge>
              )}
            </Button>

            {canCreateLinkPay && (
              <Button
                color="green"
                size="sm"
                onClick={handleCreateClick}
                disabled={isCreating}
                className="flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                {isCreating ? '處理中...' : '新增 LinkPay'}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* 展開的內容行 */}
      {open && (
        <TableRow>
          <TableCell colSpan={8} className="p-0">
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  LinkPay 付款資訊
                </h4>
              </div>

              {linkpayData.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Table dense>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableHeader className="text-xs font-medium">LinkPay 訂單編號</TableHeader>
                        <TableHeader className="text-xs font-medium">付款金額</TableHeader>
                        <TableHeader className="text-xs font-medium">付款截止日</TableHeader>
                        <TableHeader className="text-xs font-medium">付款連結</TableHeader>
                        <TableHeader className="text-xs font-medium">付款名稱</TableHeader>
                        <TableHeader className="text-xs font-medium">狀態</TableHeader>
                        <TableHeader className="text-xs font-medium">建立時間</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {linkpayData.map((item) => (
                        <TableRow key={item.linkpayOrderNumber}>
                          <TableCell className="text-sm">
                            {item.linkpayOrderNumber}
                          </TableCell>
                          <TableCell className="text-sm text-right font-mono">
                            {item.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '-'}
                          </TableCell>
                          <TableCell>
                            {item.link ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className="max-w-[150px] truncate text-sm text-blue-600"
                                  title={item.link}
                                >
                                  {item.link.substring(0, 20) + '...'}
                                </span>
                                <Button
                                  plain
                                  size="sm"
                                  onClick={() => handleCopyLink(item.link)}
                                  className="flex items-center gap-1 p-1"
                                  title="複製連結"
                                >
                                  <DocumentDuplicateIcon className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.paymentName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              color={mapLinkPayColorToBadgeColor(getLinkPayStatusColor(item.status))}
                              className="text-xs"
                            >
                              {getLinkPayStatusName(item.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.createdAt
                              ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500">
                    {canCreateLinkPay
                      ? '目前沒有 LinkPay 資訊，請點擊上方按鈕新增'
                      : '目前沒有 LinkPay 資訊'}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}