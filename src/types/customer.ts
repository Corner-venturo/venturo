/**
 * VenturoERP 2.0 顧客管理資料型別定義
 * 對應 cornerERP 的 customer 表結構
 */

export interface Customer {
  id: string
  customer_name: string
  customer_nickname?: string
  gender?: 'M' | 'F'
  birth_date?: string
  id_card?: string
  passport_no?: string
  passport_expiry?: string
  phone?: string
  mobile?: string
  email?: string
  line_id?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  dietary_restrictions?: string
  medical_conditions?: string
  notes?: string
  source?: string
  referrer?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface CustomerFormData extends Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
  id?: string
}

export interface CustomerQueryParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: keyof Customer
  sortOrder?: 'asc' | 'desc'
  is_active?: boolean
  source?: string
}

export interface CustomerStats {
  total: number
  active: number
  inactive: number
  thisMonth: number
}