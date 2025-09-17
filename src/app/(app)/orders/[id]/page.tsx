'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Divider } from '@/components/catalyst/divider'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/catalyst/description-list'
import { Select } from '@/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { useOrderStore } from '@/stores/orderStore'
import { Order, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/types/order'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeftIcon, PencilIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { CheckIcon, XMarkIcon, ClockIcon, CogIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const {
    currentOrder,
    fetchOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    error
  } = useOrderStore()

  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId).finally(() => setIsLoading(false))
    }
  }, [orderId, fetchOrderById])

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (currentOrder) {
      await updateOrderStatus(currentOrder.id, newStatus)
    }
  }

  const handlePaymentStatusUpdate = async (newPaymentStatus: Order['payment_status']) => {
    if (currentOrder) {
      await updatePaymentStatus(currentOrder.id, newPaymentStatus)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'draft':
        return <CogIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'confirmed':
        return <CheckIcon className="h-4 w-4" />
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled':
      case 'refunded':
        return <XMarkIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentOrder) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <Heading className="mt-4 text-lg font-semibold text-gray-900">訂單載入失敗</Heading>
          <Text className="mt-2 text-gray-500">{error || '找不到指定的訂單'}</Text>
          <Button className="mt-6" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* 頁面標題和動作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button color="zinc" outline onClick={() => router.back()}>
            <ArrowLeftIcon />
            返回
          </Button>
          <div>
            <Heading>{currentOrder.order_number}</Heading>
            <Text>訂單日期：{new Date(currentOrder.order_date).toLocaleDateString()}</Text>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button color="zinc" outline>
            <PrinterIcon />
            列印
          </Button>
          <Button>
            <PencilIcon />
            編輯
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要內容區域 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 訂單資訊 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Heading level={2}>訂單資訊</Heading>
              <div className="flex items-center space-x-2">
                <Badge color={ORDER_STATUS_COLORS[currentOrder.status]}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(currentOrder.status)}
                    <span>{ORDER_STATUS_LABELS[currentOrder.status]}</span>
                  </span>
                </Badge>
                <Badge color={PAYMENT_STATUS_COLORS[currentOrder.payment_status]}>
                  {PAYMENT_STATUS_LABELS[currentOrder.payment_status]}
                </Badge>
              </div>
            </div>

            <DescriptionList>
              <DescriptionTerm>客戶名稱</DescriptionTerm>
              <DescriptionDetails>{currentOrder.customer_name || '未指定'}</DescriptionDetails>

              <DescriptionTerm>聯絡人</DescriptionTerm>
              <DescriptionDetails>{currentOrder.contact_person || '-'}</DescriptionDetails>

              <DescriptionTerm>聯絡電話</DescriptionTerm>
              <DescriptionDetails>{currentOrder.contact_phone || '-'}</DescriptionDetails>

              <DescriptionTerm>聯絡信箱</DescriptionTerm>
              <DescriptionDetails>{currentOrder.contact_email || '-'}</DescriptionDetails>

              <DescriptionTerm>出發日期</DescriptionTerm>
              <DescriptionDetails>
                {currentOrder.departure_date
                  ? new Date(currentOrder.departure_date).toLocaleDateString()
                  : '-'
                }
              </DescriptionDetails>

              <DescriptionTerm>回程日期</DescriptionTerm>
              <DescriptionDetails>
                {currentOrder.return_date
                  ? new Date(currentOrder.return_date).toLocaleDateString()
                  : '-'
                }
              </DescriptionDetails>

              <DescriptionTerm>業務人員</DescriptionTerm>
              <DescriptionDetails>{currentOrder.sales_person || '-'}</DescriptionDetails>

              <DescriptionTerm>參與人數</DescriptionTerm>
              <DescriptionDetails>
                {currentOrder.total_participants} 人
                <Text className="text-sm text-gray-500 ml-2">
                  (成人{currentOrder.adult_count} 兒童{currentOrder.child_count} 嬰兒{currentOrder.infant_count})
                </Text>
              </DescriptionDetails>

              {currentOrder.special_requirements && (
                <>
                  <DescriptionTerm>特殊需求</DescriptionTerm>
                  <DescriptionDetails>{currentOrder.special_requirements}</DescriptionDetails>
                </>
              )}

              {currentOrder.notes && (
                <>
                  <DescriptionTerm>備註</DescriptionTerm>
                  <DescriptionDetails>{currentOrder.notes}</DescriptionDetails>
                </>
              )}
            </DescriptionList>
          </div>

          {/* 訂單項目 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
            <Heading level={2} className="mb-6">訂單項目</Heading>

            {currentOrder.items && currentOrder.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>項目名稱</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">單價</TableHead>
                    <TableHead className="text-right">折扣</TableHead>
                    <TableHead className="text-right">小計</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <Text className="font-medium">{item.item_name}</Text>
                          {item.item_description && (
                            <Text className="text-sm text-gray-500">{item.item_description}</Text>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.item_type === 'tour' ? '行程' :
                         item.item_type === 'service' ? '服務' : '商品'}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">
                        {item.discount_amount ? formatCurrency(item.discount_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Text className="text-gray-500">尚無訂單項目</Text>
              </div>
            )}
          </div>
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 金額摘要 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
            <Heading level={3} className="mb-4">金額摘要</Heading>

            <DescriptionList>
              <DescriptionTerm>小計金額</DescriptionTerm>
              <DescriptionDetails>{formatCurrency(currentOrder.total_amount)}</DescriptionDetails>

              <DescriptionTerm>折扣金額</DescriptionTerm>
              <DescriptionDetails className="text-red-600">
                -{formatCurrency(currentOrder.discount_amount)}
              </DescriptionDetails>

              <DescriptionTerm>稅額</DescriptionTerm>
              <DescriptionDetails>{formatCurrency(currentOrder.tax_amount)}</DescriptionDetails>
            </DescriptionList>

            <Divider className="my-4" />

            <DescriptionList>
              <DescriptionTerm className="font-semibold">總金額</DescriptionTerm>
              <DescriptionDetails className="font-semibold">
                {formatCurrency(currentOrder.final_amount)}
              </DescriptionDetails>

              <DescriptionTerm>已付金額</DescriptionTerm>
              <DescriptionDetails className="text-green-600">
                {formatCurrency(currentOrder.paid_amount)}
              </DescriptionDetails>

              <DescriptionTerm>剩餘金額</DescriptionTerm>
              <DescriptionDetails className={
                currentOrder.remaining_amount > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'
              }>
                {formatCurrency(currentOrder.remaining_amount)}
              </DescriptionDetails>
            </DescriptionList>
          </div>

          {/* 狀態管理 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
            <Heading level={3} className="mb-4">狀態管理</Heading>

            <div className="space-y-4">
              <div>
                <Text className="font-medium text-sm mb-2">訂單狀態</Text>
                <Select
                  name="status"
                  value={currentOrder.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                >
                  <option value="draft">草稿</option>
                  <option value="pending">待確認</option>
                  <option value="confirmed">已確認</option>
                  <option value="processing">處理中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                  <option value="refunded">已退款</option>
                </Select>
              </div>

              <div>
                <Text className="font-medium text-sm mb-2">付款狀態</Text>
                <Select
                  name="paymentStatus"
                  value={currentOrder.payment_status}
                  onChange={(e) => handlePaymentStatusUpdate(e.target.value as Order['payment_status'])}
                >
                  <option value="unpaid">未付款</option>
                  <option value="partial">部分付款</option>
                  <option value="paid">已付款</option>
                  <option value="refunded">已退款</option>
                </Select>
              </div>
            </div>
          </div>

          {/* 訂單歷程 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-950/5 rounded-xl p-6">
            <Heading level={3} className="mb-4">訂單歷程</Heading>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <Text className="font-medium text-sm">訂單建立</Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(currentOrder.created_at).toLocaleString()}
                  </Text>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1">
                  <Text className="font-medium text-sm">最後更新</Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(currentOrder.updated_at).toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}