import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// 重新導出 createClient 函數供其他模組使用
export { createClient } from '@supabase/supabase-js'

// 取得環境變數，提供預設值避免建置錯誤
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddortadiljxoxgxxcwoc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3J0YWRpbGp4b3hneHhjd29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDg5NTksImV4cCI6MjA3Mjk4NDk1OX0.ZD6xCCz4siKyVZCurvCOnx7r17bGUzVLck70V10fO6Q'

// 客戶端 Supabase client
export const supabase = createSupabaseClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

// 伺服器端 Supabase client 函數（僅在伺服器端使用）
export const createServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient can only be used on the server side')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}
