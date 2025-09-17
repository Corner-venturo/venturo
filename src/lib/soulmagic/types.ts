// 英靈系統類型定義

export interface God {
  code: string
  name: string
  title: string
  coreEnergy: string
  extremeExpression: string
  deficiencySymptoms: string
  color: string
  description: string
}

export interface Question {
  id: string
  chapter: number
  text: string
  type: 'poetic' | 'situation' | 'deep' | 'shadow' | 'soul'
  weight: number
  options: QuestionOption[]
}

export interface QuestionOption {
  text: string
  scores: Record<string, number> // 神祇代碼 -> 分數影響
}

export interface TestAnswer {
  questionId: string
  selectedOption: number
  responseTime: number // 毫秒
  changed: boolean // 是否修改過答案
}

export interface GodScore {
  code: string
  score: number
  normalized: number // 0-100 正規化分數
}

export interface SpiritProfile {
  id: string // P編碼格式
  threeHighs: {
    primary: GodScore
    secondary: GodScore
    tertiary: GodScore
  }
  twoLows: {
    mainShadow: GodScore
    secondShadow: GodScore
  }
  middleGods: GodScore[]
  generatedAt: Date
}

export interface TestSession {
  id: string
  userId?: string
  answers: TestAnswer[]
  currentQuestion: number
  startTime: Date
  completedAt?: Date
  profile?: SpiritProfile
}