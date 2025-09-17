import { createClient } from '@/lib/supabase/client'
import { SpiritProfile, TestSession } from '@/lib/soulmagic/types'

// 儲存英靈測驗結果
export async function saveSpiritProfile(
  profile: SpiritProfile,
  session: TestSession,
  userId?: string
) {
  const supabase = createClient()

  // 如果沒有提供 userId，嘗試從當前用戶獲取
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    userId = user.id
  }

  // 計算測驗時長
  const testDuration = session.completedAt && session.startTime
    ? Math.round((session.completedAt.getTime() - session.startTime.getTime()) / 1000 / 60)
    : null

  // 準備完整分數 JSONB 資料
  const fullScores: Record<string, number> = {}

  // 將三高二低和中間神祇整合成完整分數
  const allGods = [
    profile.threeHighs.primary,
    profile.threeHighs.secondary,
    profile.threeHighs.tertiary,
    ...profile.middleGods,
    profile.twoLows.mainShadow,
    profile.twoLows.secondShadow
  ]

  allGods.forEach(god => {
    fullScores[god.code] = god.normalized
  })

  const { data, error } = await supabase
    .from('spirit_profiles')
    .insert({
      user_id: userId,
      profile_id: profile.id,

      // 三高英靈
      primary_god: profile.threeHighs.primary.code,
      primary_score: profile.threeHighs.primary.normalized,
      secondary_god: profile.threeHighs.secondary.code,
      secondary_score: profile.threeHighs.secondary.normalized,
      tertiary_god: profile.threeHighs.tertiary.code,
      tertiary_score: profile.threeHighs.tertiary.normalized,

      // 二低陰影
      main_shadow: profile.twoLows.mainShadow.code,
      main_shadow_score: profile.twoLows.mainShadow.normalized,
      second_shadow: profile.twoLows.secondShadow.code,
      second_shadow_score: profile.twoLows.secondShadow.normalized,

      // 完整資料
      full_scores: fullScores,
      test_answers: session.answers,
      test_duration_minutes: testDuration
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving spirit profile:', error)
    throw error
  }

  return data
}

// 獲取用戶的英靈測驗歷史
export async function getUserSpiritProfiles(userId?: string) {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    userId = user.id
  }

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching spirit profiles:', error)
    throw error
  }

  return data
}

// 獲取特定的英靈測驗結果
export async function getSpiritProfile(profileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('Error fetching spirit profile:', error)
    throw error
  }

  return data
}

// 統計分析 - 取得最受歡迎的主神
export async function getPopularGods() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spirit_profiles')
    .select('primary_god')

  if (error) {
    console.error('Error fetching god statistics:', error)
    return {}
  }

  // 統計各神祇出現次數
  const godCounts: Record<string, number> = {}
  data.forEach(profile => {
    const god = profile.primary_god
    godCounts[god] = (godCounts[god] || 0) + 1
  })

  return godCounts
}