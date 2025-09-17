import { supabase } from '@/lib/supabase/client'

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  mode: 'life' | 'work'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  project_id: string | null
  is_private: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export const todosApi = {
  // 取得待辦事項
  async getTodos(userId: string, mode: 'life' | 'work', filter?: string) {
    let query = supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('mode', mode)
      .order('created_at', { ascending: false })

    if (filter && filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error loading todos:', error)
      throw error
    }
    
    return data as Todo[]
  },

  // 新增待辦事項
  async createTodo(todo: Partial<Todo>) {
    const { data, error } = await supabase
      .from('todos')
      .insert(todo)
      .select()
      .single()

    if (error) {
      console.error('Error creating todo:', error)
      throw error
    }

    return data as Todo
  },

  // 更新待辦事項
  async updateTodo(id: string, updates: Partial<Todo>) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating todo:', error)
      throw error
    }

    return data as Todo
  },

  // 刪除待辦事項
  async deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      throw error
    }

    return true
  }
}
