import { TestAnswer, GodScore, SpiritProfile } from './types'
import { godCodes } from './gods'

// 章節權重
const chapterWeights = {
  1: 0.8, // 表層自我
  2: 1.0, // 日常面具
  3: 1.2, // 內在渴望
  4: 1.5, // 陰影之地
  5: 2.0  // 靈魂核心
}

// 根據回答時間計算權重
function getTimeWeight(responseTime: number): number {
  if (responseTime < 3000) return 1.1      // 3秒內：直覺反應
  if (responseTime > 30000) return 0.9     // 超過30秒：過度思考
  return 1.0
}

// 正規化分數到 0-100
function normalizeScores(rawScores: Record<string, number>): Record<string, number> {
  const values = Object.values(rawScores)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  if (range === 0) {
    // 所有分數相同的情況
    const normalized: Record<string, number> = {}
    godCodes.forEach(code => {
      normalized[code] = 50 // 中間值
    })
    return normalized
  }

  const normalized: Record<string, number> = {}
  Object.entries(rawScores).forEach(([code, score]) => {
    normalized[code] = Math.round(((score - min) / range) * 100)
  })

  return normalized
}

// 生成唯一配置ID
function generateProfileId(sortedGods: [string, number][]): string {
  const threeHighs = sortedGods.slice(0, 3).map(([code]) =>
    godCodes.indexOf(code).toString().padStart(2, '0')
  ).join('')

  const twoLows = sortedGods.slice(-2).map(([code]) =>
    godCodes.indexOf(code).toString().padStart(2, '0')
  ).join('')

  const intensities = sortedGods.slice(0, 3).map(([_, score]) =>
    Math.round(score).toString().padStart(2, '0')
  ).join('')

  return `P${threeHighs}_${twoLows}_${intensities}`
}

// 主要計算函數
export function calculateSpiritProfile(
  answers: TestAnswer[],
  questions: any[] // 實際使用時會有完整的問題資料
): SpiritProfile {
  // 初始化12神分數
  const rawScores: Record<string, number> = {}
  godCodes.forEach(code => {
    rawScores[code] = 0
  })

  // 計算每題對各神的影響
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) return

    const selectedOption = question.options[answer.selectedOption]
    if (!selectedOption || !selectedOption.scores) return

    // 計算權重
    const chapterWeight = chapterWeights[question.chapter] || 1.0
    const timeWeight = getTimeWeight(answer.responseTime)
    const changeWeight = answer.changed ? 0.8 : 1.0

    const totalWeight = question.weight * chapterWeight * timeWeight * changeWeight

    // 應用分數影響
    Object.entries(selectedOption.scores).forEach(([godCode, impact]) => {
      if (rawScores[godCode] !== undefined) {
        rawScores[godCode] += impact * totalWeight
      }
    })
  })

  // 正規化分數
  const normalizedScores = normalizeScores(rawScores)

  // 轉換為GodScore陣列並排序
  const godScores: GodScore[] = godCodes.map(code => ({
    code,
    score: rawScores[code],
    normalized: normalizedScores[code]
  })).sort((a, b) => b.normalized - a.normalized)

  // 生成配置ID
  const sortedForId: [string, number][] = godScores.map(gs => [gs.code, gs.normalized])
  const profileId = generateProfileId(sortedForId)

  // 建立最終配置
  const profile: SpiritProfile = {
    id: profileId,
    threeHighs: {
      primary: godScores[0],
      secondary: godScores[1],
      tertiary: godScores[2]
    },
    twoLows: {
      mainShadow: godScores[10],
      secondShadow: godScores[11]
    },
    middleGods: godScores.slice(3, 10),
    generatedAt: new Date()
  }

  return profile
}