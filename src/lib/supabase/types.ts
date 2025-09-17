// Database 類型定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          role: 'ADMIN' | 'ASSISTANT' | 'ACCOUNTANT' | 'SALES' | 'STAFF' | 'PUBLIC'
          department: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          role?: 'ADMIN' | 'ASSISTANT' | 'ACCOUNTANT' | 'SALES' | 'STAFF' | 'PUBLIC'
          department?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          role?: 'ADMIN' | 'ASSISTANT' | 'ACCOUNTANT' | 'SALES' | 'STAFF' | 'PUBLIC'
          department?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          mode?: 'life' | 'work'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          project_id?: string | null
          is_private?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          mode?: 'life' | 'work'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          project_id?: string | null
          is_private?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timeboxes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          scheduled_date: string
          start_time: string
          duration_minutes: number
          status: 'planned' | 'in_progress' | 'completed' | 'skipped'
          actual_start: string | null
          actual_end: string | null
          completion_rate: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          scheduled_date: string
          start_time: string
          duration_minutes: number
          status?: 'planned' | 'in_progress' | 'completed' | 'skipped'
          actual_start?: string | null
          actual_end?: string | null
          completion_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          scheduled_date?: string
          start_time?: string
          duration_minutes?: number
          status?: 'planned' | 'in_progress' | 'completed' | 'skipped'
          actual_start?: string | null
          actual_end?: string | null
          completion_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string | null
          team_ids: string[]
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          visibility: 'private' | 'team' | 'company'
          start_date: string | null
          end_date: string | null
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id?: string | null
          team_ids?: string[]
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          visibility?: 'private' | 'team' | 'company'
          start_date?: string | null
          end_date?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string | null
          team_ids?: string[]
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          visibility?: 'private' | 'team' | 'company'
          start_date?: string | null
          end_date?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types
export type UserRole = Database['public']['Tables']['profiles']['Row']['role']
export type TodoStatus = Database['public']['Tables']['todos']['Row']['status']
export type TodoPriority = Database['public']['Tables']['todos']['Row']['priority']
export type ProjectStatus = Database['public']['Tables']['projects']['Row']['status']
