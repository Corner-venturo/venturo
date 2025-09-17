import { createClient } from '@/lib/supabase/client'

// 管理員專用：獲取待孵化的英靈列表
export async function getPendingSpirits() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select(`
      id,
      user_id,
      profile_id,
      primary_god,
      primary_score,
      secondary_god,
      secondary_score,
      tertiary_god,
      tertiary_score,
      main_shadow,
      main_shadow_score,
      second_shadow,
      second_shadow_score,
      full_scores,
      spirit_generated,
      created_at,
      profiles!inner(display_name, email)
    `)
    .eq('spirit_generated', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending spirits:', error)
    throw error
  }

  return data
}

// 管理員專用：回填英靈詳細資料
export async function updateSpiritDetails(
  spiritId: string,
  spiritData: {
    spirit_title: string
    spirit_appearance: {
      hair: string
      eyes: string
      aura: string
      features: string[]
    }
    spirit_essence: string
    spirit_amnesia: {
      forgotten: string
      impact: string
    }
    spirit_growth: {
      challenge: string
      path: string
      blessing: string
    }
    spirit_poem: string
  },
  adminUserId: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .update({
      spirit_generated: true,
      spirit_title: spiritData.spirit_title,
      spirit_appearance: spiritData.spirit_appearance,
      spirit_essence: spiritData.spirit_essence,
      spirit_amnesia: spiritData.spirit_amnesia,
      spirit_growth: spiritData.spirit_growth,
      spirit_poem: spiritData.spirit_poem,
      generated_by: adminUserId,
      generated_at: new Date().toISOString()
    })
    .eq('id', spiritId)
    .select()
    .single()

  if (error) {
    console.error('Error updating spirit details:', error)
    throw error
  }

  return data
}

// 獲取已生成的英靈詳情（用戶端）
export async function getUserGeneratedSpirit(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('spirit_generated', true)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching generated spirit:', error)
    throw error
  }

  return data || null
}

// 檢查用戶是否有已生成的英靈
export async function checkUserSpiritStatus(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select('id, spirit_generated, created_at, generated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking spirit status:', error)
    throw error
  }

  return data || null
}