import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// 這個檔案只能在伺服器端使用 (API routes, Server Components)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
)

// 伺服器端 Supabase client 建立函數 (與 cornerERP 相容)
export const createClient = () => {
  return supabaseAdmin
}
