import { God } from './types'

export const gods: Record<string, God> = {
  ATH: {
    code: 'ATH',
    name: '雅典娜',
    title: 'Athena',
    coreEnergy: '理性智慧',
    extremeExpression: '純粹邏輯、透徹分析',
    deficiencySymptoms: '冷漠、過度理性',
    color: '#4A90E2',
    description: '智慧與戰略之神，以理性洞察引領前路'
  },
  APH: {
    code: 'APH',
    name: '阿芙蘿黛蒂',
    title: 'Aphrodite',
    coreEnergy: '感性之愛',
    extremeExpression: '深度共感、情感流動',
    deficiencySymptoms: '情緒化、邊界模糊',
    color: '#E91E63',
    description: '愛與美之神，以情感共鳴連結萬物'
  },
  HER: {
    code: 'HER',
    name: '赫爾墨斯',
    title: 'Hermes',
    coreEnergy: '行動敏捷',
    extremeExpression: '即刻執行、靈活應變',
    deficiencySymptoms: '衝動、缺乏深思',
    color: '#FF9800',
    description: '信使之神，以迅速行動創造可能'
  },
  ODI: {
    code: 'ODI',
    name: '奧丁',
    title: 'Odin',
    coreEnergy: '深度思索',
    extremeExpression: '洞察本質、智慧沉澱',
    deficiencySymptoms: '過度思考、行動癱瘓',
    color: '#607D8B',
    description: '智慧之父，以深思熟慮窺見真理'
  },
  PRO: {
    code: 'PRO',
    name: '普羅米修斯',
    title: 'Prometheus',
    coreEnergy: '創造火種',
    extremeExpression: '突破創新、靈感湧現',
    deficiencySymptoms: '躁動不安、破壞秩序',
    color: '#F44336',
    description: '創新之神，以創造之火點燃新世界'
  },
  ZEU: {
    code: 'ZEU',
    name: '宙斯',
    title: 'Zeus',
    coreEnergy: '秩序統治',
    extremeExpression: '建立架構、維持穩定',
    deficiencySymptoms: '僵化控制、失去彈性',
    color: '#3F51B5',
    description: '眾神之王，以秩序力量統馭萬象'
  },
  HOR: {
    code: 'HOR',
    name: '荷魯斯',
    title: 'Horus',
    coreEnergy: '領導權威',
    extremeExpression: '承擔責任、號召引領',
    deficiencySymptoms: '獨斷專行、忽視他人',
    color: '#795548',
    description: '天空之神，以領導威嚴指引方向'
  },
  LOK: {
    code: 'LOK',
    name: '洛基',
    title: 'Loki',
    coreEnergy: '自由不羈',
    extremeExpression: '獨立自主、不受束縛',
    deficiencySymptoms: '逃避責任、缺乏歸屬',
    color: '#9C27B0',
    description: '變化之神，以自由意志打破框架'
  },
  ISI: {
    code: 'ISI',
    name: '伊西斯',
    title: 'Isis',
    coreEnergy: '夢想願景',
    extremeExpression: '遠見理想、靈性追求',
    deficiencySymptoms: '不切實際、逃避現實',
    color: '#00BCD4',
    description: '魔法女神，以夢想願力創造奇蹟'
  },
  HEP: {
    code: 'HEP',
    name: '赫菲斯托斯',
    title: 'Hephaestus',
    coreEnergy: '實踐工匠',
    extremeExpression: '落地執行、精工細作',
    deficiencySymptoms: '短視近利、缺乏願景',
    color: '#8BC34A',
    description: '工匠之神，以實作技藝築造現實'
  },
  AMA: {
    code: 'AMA',
    name: '阿瑪特拉斯',
    title: 'Amaterasu',
    coreEnergy: '挑戰突破',
    extremeExpression: '勇於冒險、打破限制',
    deficiencySymptoms: '魯莽衝撞、忽視風險',
    color: '#FFC107',
    description: '太陽女神，以挑戰精神照亮未知'
  },
  FRE: {
    code: 'FRE',
    name: '芙蕾雅',
    title: 'Freya',
    coreEnergy: '療癒修復',
    extremeExpression: '撫慰傷痛、重建連結',
    deficiencySymptoms: '逃避衝突、過度退讓',
    color: '#4CAF50',
    description: '愛與戰爭女神，以療癒之愛修復破碎'
  }
}

export const godCodes = Object.keys(gods)
export const godArray = Object.values(gods)