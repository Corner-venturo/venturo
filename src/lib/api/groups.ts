/**
 * 團體管理 API
 */

export interface Group {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// 暫時返回空數據，避免構建錯誤
export async function getGroups(): Promise<Group[]> {
  return []
}

export async function getGroup(id: string): Promise<Group | null> {
  return null
}

export async function createGroup(data: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
  throw new Error('Not implemented')
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  throw new Error('Not implemented')
}

export async function deleteGroup(id: string): Promise<void> {
  throw new Error('Not implemented')
}