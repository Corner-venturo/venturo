/**
 * 團體管理 API
 */

export interface Group {
  id: string
  name: string
  description?: string
  status: number
  sales_person: string
  departure_date: string
  return_date: string
  created_at: string
  updated_at: string
}

// 狀態映射
export const GROUP_STATUS_NAMES = {
  0: '詢問中',
  1: '已確認',
  2: '進行中',
  3: '已完成',
  4: '已取消'
}

export const GROUP_STATUS_COLORS = {
  0: 'yellow',
  1: 'blue',
  2: 'green',
  3: 'gray',
  4: 'red'
}

// 工具函數
export function isGroupUpcoming(group: Group): boolean {
  return new Date(group.departure_date) > new Date()
}

export function isGroupOngoing(group: Group): boolean {
  const now = new Date()
  const departureDate = new Date(group.departure_date)
  const returnDate = new Date(group.return_date)
  return departureDate <= now && now <= returnDate
}

export function calculateGroupDuration(group: Group): number {
  const departure = new Date(group.departure_date)
  const returnDate = new Date(group.return_date)
  return Math.ceil((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24))
}

interface GroupFilters {
  search?: string
  status?: number
  salesPerson?: string
}

interface GroupsResponse {
  data: Group[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API 對象
export const groupsAPI = {
  async getAll(page = 1, limit = 20, filters: GroupFilters = {}): Promise<GroupsResponse> {
    // 暫時返回空數據
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1
      }
    }
  },

  async getById(id: string): Promise<Group | null> {
    return null
  },

  async create(data: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
    throw new Error('Not implemented')
  },

  async update(id: string, data: Partial<Group>): Promise<Group> {
    throw new Error('Not implemented')
  },

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented')
  },

  async deleteMany(ids: string[]): Promise<void> {
    throw new Error('Not implemented')
  }
}

// 保持向後兼容的函數導出
export async function getGroups(): Promise<Group[]> {
  const response = await groupsAPI.getAll()
  return response.data
}

export async function getGroup(id: string): Promise<Group | null> {
  return groupsAPI.getById(id)
}

export async function createGroup(data: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
  return groupsAPI.create(data)
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  return groupsAPI.update(id, data)
}

export async function deleteGroup(id: string): Promise<void> {
  return groupsAPI.delete(id)
}