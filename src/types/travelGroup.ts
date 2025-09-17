/**
 * VenturoERP 2.0 旅遊團管理資料型別定義
 * 對應 cornerERP 的 travel_groups 表結構
 */

export type TravelGroupStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface TravelGroup {
  id: string
  group_name: string
  group_code: string
  destination: string
  departure_date: string
  return_date: string
  duration_days: number
  max_participants: number
  current_participants: number
  price_per_person: number
  total_cost: number
  profit_margin?: number
  status: TravelGroupStatus
  description?: string
  itinerary_summary?: string
  accommodation_info?: string
  transportation_info?: string
  meal_info?: string
  special_notes?: string
  cancellation_policy?: string
  insurance_info?: string
  guide_assignment?: string
  meeting_point?: string
  meeting_time?: string
  contact_person?: string
  contact_phone?: string
  bonus_points?: number
  early_bird_discount?: number
  group_discount?: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface TravelGroupFormData extends Omit<TravelGroup, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
  id?: string
}

export interface TravelGroupQueryParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: keyof TravelGroup
  sortOrder?: 'asc' | 'desc'
  status?: TravelGroupStatus
  destination?: string
  is_active?: boolean
  departure_date_from?: string
  departure_date_to?: string
}

export interface TravelGroupStats {
  total: number
  planning: number
  confirmed: number
  in_progress: number
  completed: number
  cancelled: number
  thisMonth: number
  totalRevenue: number
  averagePrice: number
}

export const TRAVEL_GROUP_STATUS_LABELS: Record<TravelGroupStatus, string> = {
  planning: '規劃中',
  confirmed: '已確認',
  in_progress: '進行中',
  completed: '已完成',
  cancelled: '已取消'
}

export const TRAVEL_GROUP_STATUS_COLORS: Record<TravelGroupStatus, string> = {
  planning: 'yellow',
  confirmed: 'blue',
  in_progress: 'green',
  completed: 'gray',
  cancelled: 'red'
}