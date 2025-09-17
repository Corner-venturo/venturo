/**
 * VenturoERP 2.0 訂單管理資料型別定義
 * 對應 cornerERP 的 orders 表結構
 */

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'
export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'check' | 'other'

export interface OrderItem {
  id: string
  order_id: string
  travel_group_id?: string
  item_type: 'tour' | 'service' | 'product'
  item_name: string
  item_description?: string
  quantity: number
  unit_price: number
  discount_amount?: number
  subtotal: number
  notes?: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name?: string // 關聯查詢時填充
  order_date: string
  departure_date?: string
  return_date?: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  paid_amount: number
  remaining_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  payment_due_date?: string
  adult_count: number
  child_count: number
  infant_count: number
  total_participants: number
  special_requirements?: string
  notes?: string
  internal_notes?: string

  // 聯絡資訊
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  emergency_contact?: string
  emergency_phone?: string

  // 業務資訊
  sales_person?: string
  commission_rate?: number
  commission_amount?: number
  source?: string
  referrer?: string

  // 取消相關
  cancellation_reason?: string
  cancellation_date?: string
  cancellation_fee?: number
  refund_amount?: number

  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string

  // 關聯資料（查詢時填充）
  items?: OrderItem[]
}

export interface OrderFormData extends Omit<Order, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
  id?: string
  items: Omit<OrderItem, 'id' | 'order_id'>[]
}

export interface OrderQueryParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: keyof Order
  sortOrder?: 'asc' | 'desc'
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_id?: string
  sales_person?: string
  order_date_from?: string
  order_date_to?: string
  departure_date_from?: string
  departure_date_to?: string
  is_active?: boolean
}

export interface OrderStats {
  total: number
  draft: number
  pending: number
  confirmed: number
  processing: number
  completed: number
  cancelled: number
  refunded: number
  thisMonth: number
  totalRevenue: number
  totalPaid: number
  totalOutstanding: number
  averageOrderValue: number
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: '草稿',
  pending: '待確認',
  confirmed: '已確認',
  processing: '處理中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: '未付款',
  partial: '部分付款',
  paid: '已付款',
  refunded: '已退款'
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '現金',
  transfer: '銀行轉帳',
  credit_card: '信用卡',
  check: '支票',
  other: '其他'
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  pending: 'yellow',
  confirmed: 'blue',
  processing: 'purple',
  completed: 'green',
  cancelled: 'red',
  refunded: 'orange'
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'red',
  partial: 'yellow',
  paid: 'green',
  refunded: 'orange'
}