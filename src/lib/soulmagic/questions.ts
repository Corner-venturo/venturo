import { Question } from './types'

export const questions: Question[] = [
  // 第一章：晨光初現 (1-20) - 權重 0.8
  {
    id: "Q1",
    chapter: 1,
    text: "天快亮了，夜色正在褪去\n此刻你心裡升起的是...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "終於能看清一切的期待", scores: { ATH: 5, HER: 2 } },
      { text: "對夜晚離去的不捨", scores: { APH: 5, ISI: 3 } },
      { text: "想要創造什麼的衝動", scores: { PRO: 5, AMA: 2 } },
      { text: "在寧靜中繼續沉澱", scores: { ODI: 5, FRE: 2 } }
    ]
  },
  {
    id: "Q2",
    chapter: 1,
    text: "此刻，你的內在狀態最像...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "清澈見底的湖水", scores: { ATH: 4, ZEU: 3 } },
      { text: "深不可測的海洋", scores: { ODI: 5, APH: 2 } },
      { text: "奔流不息的河水", scores: { HER: 5, LOK: 2 } },
      { text: "變幻莫測的雲霧", scores: { PRO: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q3",
    chapter: 1,
    text: "你和自己的影子...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "我知道它永遠跟著我", scores: { ZEU: 4, HOR: 3 } },
      { text: "我常常忘記它的存在", scores: { LOK: 5, ISI: 2 } },
      { text: "它提醒我光在哪裡", scores: { ATH: 3, FRE: 4 } },
      { text: "它像另一個版本的我", scores: { ODI: 4, APH: 3 } }
    ]
  },
  {
    id: "Q4",
    chapter: 1,
    text: "安靜下來時，你內心的聲音像...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "清脆俐落的鈴聲", scores: { ATH: 5, HER: 1 } },
      { text: "低沉溫柔的大提琴", scores: { APH: 5, FRE: 2 } },
      { text: "風吹過樹葉的細語", scores: { ODI: 4, ISI: 3 } },
      { text: "火花爆裂的聲響", scores: { PRO: 4, AMA: 4 } }
    ]
  },
  {
    id: "Q5",
    chapter: 1,
    text: "對你來說，時間感覺像...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "精準運轉的齒輪", scores: { ZEU: 5, HEP: 2 } },
      { text: "永遠不夠的流沙", scores: { HER: 5, AMA: 2 } },
      { text: "可以隨意塑形的黏土", scores: { PRO: 5, LOK: 3 } },
      { text: "靜止的琥珀", scores: { ODI: 5, FRE: 2 } }
    ]
  },
  {
    id: "Q6",
    chapter: 1,
    text: "如果風有性格，你希望成為...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "指引方向的信風", scores: { HOR: 5, ATH: 2 } },
      { text: "溫柔撫慰的微風", scores: { APH: 5, FRE: 2 } },
      { text: "快速掠過的疾風", scores: { HER: 5, AMA: 3 } },
      { text: "深谷中沉思的風", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q7",
    chapter: 1,
    text: "仰望夜空，最觸動你的是...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "恆星永恆不變的位置", scores: { ZEU: 5, HOR: 2 } },
      { text: "流星劃過的瞬間", scores: { AMA: 5, LOK: 3 } },
      { text: "銀河述說的遠古故事", scores: { ISI: 5, APH: 2 } },
      { text: "宇宙深處的未知", scores: { ODI: 5, PRO: 1 } }
    ]
  },
  {
    id: "Q8",
    chapter: 1,
    text: "哪種顏色最能代表你的本質？",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "深藍 - 深邃冷靜", scores: { ATH: 5, ODI: 2 } },
      { text: "金色 - 溫暖堅定", scores: { HOR: 5, HEP: 3 } },
      { text: "紫色 - 神秘多變", scores: { ISI: 4, PRO: 3 } },
      { text: "透明 - 自由流動", scores: { LOK: 5, FRE: 2 } }
    ]
  },
  {
    id: "Q9",
    chapter: 1,
    text: "人生像一扇門，你覺得...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "需要找到正確的鑰匙", scores: { ATH: 4, ZEU: 3 } },
      { text: "推開就有新的冒險", scores: { AMA: 5, PRO: 2 } },
      { text: "門後有人在等你", scores: { APH: 5, FRE: 3 } },
      { text: "每扇門通往平行世界", scores: { ISI: 4, ODI: 3 } }
    ]
  },
  {
    id: "Q10",
    chapter: 1,
    text: "聽著雨聲，你的心情...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "變得更加清明", scores: { ATH: 4, ZEU: 3 } },
      { text: "湧起莫名的溫柔", scores: { APH: 5, FRE: 2 } },
      { text: "想要立刻做些什麼", scores: { HER: 5, AMA: 2 } },
      { text: "沉入深深的思緒", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q11",
    chapter: 1,
    text: "如果你是一棵樹，你最珍視的是...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "筆直向上的意志", scores: { HOR: 4, ZEU: 3 } },
      { text: "深深扎根的力量", scores: { HEP: 5, ODI: 2 } },
      { text: "隨風搖曳的自在", scores: { LOK: 5, PRO: 2 } },
      { text: "為他人遮蔭的能力", scores: { FRE: 5, APH: 2 } }
    ]
  },
  {
    id: "Q12",
    chapter: 1,
    text: "凝視火焰時，你想到...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "能量如何完美轉換", scores: { ATH: 4, HEP: 3 } },
      { text: "生命在燃燒中起舞", scores: { PRO: 5, APH: 2 } },
      { text: "毀滅才能帶來新生", scores: { AMA: 5, LOK: 2 } },
      { text: "溫暖可以療癒一切", scores: { FRE: 4, HOR: 3 } }
    ]
  },
  {
    id: "Q13",
    chapter: 1,
    text: "鏡子裡，你看見自己眼中有...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "清晰的決心", scores: { ATH: 5, HER: 2 } },
      { text: "未被察覺的溫柔", scores: { APH: 4, FRE: 3 } },
      { text: "還在醞釀的夢想", scores: { ISI: 5, PRO: 2 } },
      { text: "準備承擔的勇氣", scores: { HOR: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q14",
    chapter: 1,
    text: "手心裡的石頭，感覺像...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "時間凝結的智慧", scores: { ODI: 5, HEP: 2 } },
      { text: "等待雕琢的可能", scores: { PRO: 4, ISI: 3 } },
      { text: "永恆不變的承諾", scores: { ZEU: 5, ATH: 2 } },
      { text: "想要隨波逐流的心", scores: { LOK: 4, FRE: 3 } }
    ]
  },
  {
    id: "Q15",
    chapter: 1,
    text: "被晨霧包圍時，你感到...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "需要等待真相顯現", scores: { ATH: 4, ZEU: 3 } },
      { text: "朦朧也是種美", scores: { APH: 5, ISI: 2 } },
      { text: "渴望穿透迷霧", scores: { HER: 5, AMA: 2 } },
      { text: "在模糊中找到安寧", scores: { FRE: 4, ODI: 3 } }
    ]
  },
  {
    id: "Q16",
    chapter: 1,
    text: "今夜的月光，像在對你說...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "保持清醒的距離", scores: { ATH: 5, ODI: 2 } },
      { text: "我會溫柔守護你", scores: { FRE: 5, APH: 2 } },
      { text: "跟隨我去遠方", scores: { ISI: 4, HOR: 3 } },
      { text: "你本就自由如我", scores: { LOK: 5, PRO: 2 } }
    ]
  },
  {
    id: "Q17",
    chapter: 1,
    text: "空白面前，你的第一個衝動是...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "建立清晰的結構", scores: { ZEU: 5, ATH: 2 } },
      { text: "讓情感自然流淌", scores: { APH: 4, PRO: 3 } },
      { text: "打破所有規則", scores: { AMA: 5, HER: 2 } },
      { text: "先沉思其意義", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q18",
    chapter: 1,
    text: "看見遠山時，你的心...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "想要站在最高處", scores: { AMA: 5, HOR: 2 } },
      { text: "尋找屬於自己的高度", scores: { ZEU: 4, HEP: 3 } },
      { text: "嚮往那份寧靜", scores: { FRE: 5, ODI: 2 } },
      { text: "好奇山的另一邊", scores: { LOK: 4, PRO: 3 } }
    ]
  },
  {
    id: "Q19",
    chapter: 1,
    text: "從夢中醒來，殘留的感覺是...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "想要理解夢的邏輯", scores: { ATH: 5, HER: 1 } },
      { text: "情緒還在心中迴盪", scores: { APH: 5, ISI: 2 } },
      { text: "似乎藏著重要訊息", scores: { ODI: 4, PRO: 3 } },
      { text: "像被溫柔擁抱過", scores: { FRE: 5, APH: 2 } }
    ]
  },
  {
    id: "Q20",
    chapter: 1,
    text: "經過這段晨光之旅，你感受到自己...",
    type: "poetic",
    weight: 0.8,
    options: [
      { text: "思緒變得更加清晰", scores: { ATH: 4, HER: 3 } },
      { text: "內心某處被輕輕觸動", scores: { APH: 4, FRE: 3 } },
      { text: "有股能量正在甦醒", scores: { LOK: 5, AMA: 2 } },
      { text: "在寧靜中更認識自己", scores: { ODI: 5, ZEU: 2 } }
    ]
  },

  // 第二章：日常面具 (21-40) - 權重 1.0
  {
    id: "Q21",
    chapter: 2,
    text: "睜開眼睛的瞬間，你通常...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "立刻清醒，思考今天", scores: { ATH: 4, HER: 3 } },
      { text: "想再賴床一下下", scores: { FRE: 5, APH: 2 } },
      { text: "期待會發生什麼新鮮事", scores: { PRO: 4, LOK: 3 } },
      { text: "慢慢回到現實世界", scores: { ODI: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q22",
    chapter: 2,
    text: "沒有計劃的週末下午，你會...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "終於可以整理思緒", scores: { ATH: 4, ZEU: 3 } },
      { text: "隨意翻書或發呆", scores: { LOK: 5, ISI: 2 } },
      { text: "動手做些什麼", scores: { HEP: 5, PRO: 2 } },
      { text: "享受這份寧靜", scores: { FRE: 5, ODI: 2 } }
    ]
  },
  {
    id: "Q23",
    chapter: 2,
    text: "需要等待時（等車、排隊），你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "在腦中規劃事情", scores: { ATH: 5, HER: 2 } },
      { text: "觀察周圍的人事物", scores: { ODI: 4, APH: 3 } },
      { text: "有點焦躁想做點什麼", scores: { HER: 5, AMA: 2 } },
      { text: "把這當作休息時間", scores: { FRE: 5, LOK: 2 } }
    ]
  },
  {
    id: "Q24",
    chapter: 2,
    text: "晚上11點，你通常在...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "完成今天最後的事", scores: { HEP: 4, ZEU: 3 } },
      { text: "沉浸在自己的世界", scores: { ISI: 5, ODI: 2 } },
      { text: "和重要的人聊天", scores: { APH: 5, FRE: 2 } },
      { text: "計劃明天的冒險", scores: { PRO: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q25",
    chapter: 2,
    text: "收到意料之外的禮物時，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "想知道對方為何送禮", scores: { ATH: 4, ODI: 3 } },
      { text: "被心意深深感動", scores: { APH: 5, FRE: 2 } },
      { text: "立刻想要回禮", scores: { HER: 4, HOR: 3 } },
      { text: "享受這個驚喜", scores: { LOK: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q26",
    chapter: 2,
    text: "你的私人空間通常...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "每樣東西都有固定位置", scores: { ZEU: 5, ATH: 2 } },
      { text: "溫馨但有點凌亂", scores: { APH: 4, FRE: 3 } },
      { text: "充滿各種進行中的計畫", scores: { PRO: 5, HER: 2 } },
      { text: "極簡，只有必需品", scores: { ODI: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q27",
    chapter: 2,
    text: "聽音樂時，你最常...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "分析歌詞的意義", scores: { ATH: 4, ODI: 3 } },
      { text: "沉浸在旋律帶來的感受", scores: { APH: 5, ISI: 2 } },
      { text: "跟著節奏律動", scores: { HER: 4, AMA: 3 } },
      { text: "當作背景音樂", scores: { FRE: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q28",
    chapter: 2,
    text: "獨自走路時，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "保持穩定的步調", scores: { ZEU: 5, HEP: 2 } },
      { text: "走走停停，隨興而至", scores: { LOK: 5, ISI: 2 } },
      { text: "總是走得很快", scores: { HER: 5, AMA: 2 } },
      { text: "邊走邊深思", scores: { ODI: 5, ATH: 2 } }
    ]
  },
  {
    id: "Q29",
    chapter: 2,
    text: "和朋友聊天時，你更常...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "提供建議和分析", scores: { ATH: 5, HOR: 2 } },
      { text: "傾聽和同理", scores: { APH: 4, FRE: 3 } },
      { text: "分享新奇的想法", scores: { PRO: 5, ISI: 2 } },
      { text: "激勵大家去行動", scores: { HER: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q30",
    chapter: 2,
    text: "面對選擇時，你傾向...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "列出所有利弊", scores: { ATH: 5, ZEU: 2 } },
      { text: "跟著直覺走", scores: { APH: 4, LOK: 3 } },
      { text: "選最有趣的那個", scores: { PRO: 5, AMA: 2 } },
      { text: "想很久還是難以決定", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q31",
    chapter: 2,
    text: "如果要選一本書，你會選...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "邏輯推理或知識類", scores: { ATH: 5, ODI: 2 } },
      { text: "觸動人心的故事", scores: { APH: 5, ISI: 2 } },
      { text: "實用技能或工具書", scores: { HEP: 5, HER: 2 } },
      { text: "奇幻冒險或科幻", scores: { PRO: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q32",
    chapter: 2,
    text: "整理物品時，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "按照系統分類", scores: { ZEU: 5, ATH: 2 } },
      { text: "憑感覺決定去留", scores: { APH: 4, LOK: 3 } },
      { text: "邊整理邊發現寶藏", scores: { PRO: 4, ISI: 3 } },
      { text: "很快就完成", scores: { HER: 5, HEP: 2 } }
    ]
  },
  {
    id: "Q33",
    chapter: 2,
    text: "遇見美麗風景時，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "想了解形成的原因", scores: { ATH: 4, ODI: 3 } },
      { text: "被深深感動", scores: { APH: 5, FRE: 2 } },
      { text: "想要立刻拍照記錄", scores: { HER: 4, HEP: 3 } },
      { text: "靜靜地感受當下", scores: { FRE: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q34",
    chapter: 2,
    text: "對於計劃這件事，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "喜歡詳細規劃", scores: { ZEU: 5, ATH: 2 } },
      { text: "計劃趕不上變化", scores: { LOK: 5, PRO: 2 } },
      { text: "有大方向就好", scores: { HOR: 4, HER: 3 } },
      { text: "隨緣，船到橋頭自然直", scores: { FRE: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q35",
    chapter: 2,
    text: "你手機裡最多的是...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "實用的截圖資訊", scores: { ATH: 4, HEP: 3 } },
      { text: "和重要人的合照", scores: { APH: 5, FRE: 2 } },
      { text: "各種靈感收集", scores: { PRO: 5, ISI: 2 } },
      { text: "去過的地方", scores: { LOK: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q36",
    chapter: 2,
    text: "理想的早晨是...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "一切按部就班", scores: { ZEU: 5, HEP: 2 } },
      { text: "慵懶而溫暖", scores: { FRE: 5, APH: 2 } },
      { text: "充滿新的可能", scores: { PRO: 4, AMA: 3 } },
      { text: "安靜而深刻", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q37",
    chapter: 2,
    text: "挑選禮物時，你會...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "研究對方真正需要什麼", scores: { ATH: 4, HEP: 3 } },
      { text: "選擇有意義的東西", scores: { APH: 5, ISI: 2 } },
      { text: "挑選獨特有創意的", scores: { PRO: 5, LOK: 2 } },
      { text: "選實用的準沒錯", scores: { HEP: 4, ZEU: 3 } }
    ]
  },
  {
    id: "Q38",
    chapter: 2,
    text: "生活出現變化時，你...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "分析並適應", scores: { ATH: 4, HER: 3 } },
      { text: "感受其中的意義", scores: { APH: 4, ODI: 3 } },
      { text: "興奮於新的可能", scores: { PRO: 5, AMA: 2 } },
      { text: "保持內在的穩定", scores: { FRE: 4, ZEU: 3 } }
    ]
  },
  {
    id: "Q39",
    chapter: 2,
    text: "準備入睡前，你常常...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "回顧今天，計劃明天", scores: { ATH: 4, ZEU: 3 } },
      { text: "想著某個人或某件事", scores: { APH: 5, ISI: 2 } },
      { text: "腦中還有很多想法", scores: { PRO: 4, ODI: 3 } },
      { text: "放空一切準備休息", scores: { FRE: 5, LOK: 2 } }
    ]
  },
  {
    id: "Q40",
    chapter: 2,
    text: "獨處對你來說是...",
    type: "situation",
    weight: 1.0,
    options: [
      { text: "整理思緒的必要", scores: { ATH: 5, ODI: 2 } },
      { text: "與自己對話的時刻", scores: { APH: 4, ISI: 3 } },
      { text: "充電後再出發", scores: { HER: 4, FRE: 3 } },
      { text: "自由自在的享受", scores: { LOK: 5, PRO: 2 } }
    ]
  },

  // 第三章：內在渴望 (41-60) - 權重 1.2
  {
    id: "Q41",
    chapter: 3,
    text: "如果沒有任何限制，你最想...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "理解宇宙運作的真理", scores: { ATH: 5, ODI: 3 } },
      { text: "體驗所有形式的愛", scores: { APH: 5, FRE: 2 } },
      { text: "創造改變世界的東西", scores: { PRO: 5, HOR: 2 } },
      { text: "完全的自由自在", scores: { LOK: 5, AMA: 2 } }
    ]
  },
  {
    id: "Q42",
    chapter: 3,
    text: "你內心深處最怕失去的是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "清晰的思考能力", scores: { ATH: 5, ZEU: 2 } },
      { text: "愛與被愛的能力", scores: { APH: 5, FRE: 2 } },
      { text: "創造的熱情", scores: { PRO: 5, ISI: 2 } },
      { text: "選擇的自由", scores: { LOK: 5, HER: 2 } }
    ]
  },
  {
    id: "Q43",
    chapter: 3,
    text: "理想中的自己是個...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "智慧的引導者", scores: { ATH: 4, HOR: 3 } },
      { text: "溫暖的療癒者", scores: { FRE: 5, APH: 3 } },
      { text: "無畏的開創者", scores: { AMA: 5, PRO: 2 } },
      { text: "深邃的哲學家", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q44",
    chapter: 3,
    text: "如果能擁有一種能力...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "看透事物本質", scores: { ATH: 5, ODI: 2 } },
      { text: "感受他人真實情感", scores: { APH: 5, FRE: 2 } },
      { text: "瞬間移動到任何地方", scores: { HER: 5, LOK: 2 } },
      { text: "創造出不存在的東西", scores: { PRO: 5, ISI: 3 } }
    ]
  },
  {
    id: "Q45",
    chapter: 3,
    text: "安靜下來時，你最常聽見內心說...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "要更清楚、更精準", scores: { ATH: 5, ZEU: 2 } },
      { text: "要更溫柔、更有愛", scores: { APH: 4, FRE: 3 } },
      { text: "要更勇敢、更突破", scores: { AMA: 5, HER: 2 } },
      { text: "要更深刻、更真實", scores: { ODI: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q46",
    chapter: 3,
    text: "你覺得最常被誤解的是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "理性不代表冷漠", scores: { ATH: 5, APH: 1 } },
      { text: "溫柔不代表軟弱", scores: { APH: 4, HER: 2 } },
      { text: "自由不代表不負責", scores: { LOK: 5, HOR: 1 } },
      { text: "沉默不代表無話可說", scores: { ODI: 5, FRE: 2 } }
    ]
  },
  {
    id: "Q47",
    chapter: 3,
    text: "你最希望有人看見你的...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "縝密的思考過程", scores: { ATH: 4, HEP: 3 } },
      { text: "細膩的情感世界", scores: { APH: 5, ISI: 2 } },
      { text: "瘋狂的創意想法", scores: { PRO: 5, AMA: 2 } },
      { text: "獨特的生命哲學", scores: { ODI: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q48",
    chapter: 3,
    text: "完美的一天會包含...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "解決了困擾已久的問題", scores: { ATH: 4, HEP: 3 } },
      { text: "與重要的人深度連結", scores: { APH: 5, FRE: 2 } },
      { text: "完成了創造性的突破", scores: { PRO: 5, HER: 2 } },
      { text: "體驗了全新的冒險", scores: { AMA: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q49",
    chapter: 3,
    text: "如果要寫一本書，會是關於...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "如何理解這個世界", scores: { ATH: 5, ODI: 2 } },
      { text: "愛的千百種形式", scores: { APH: 5, ISI: 2 } },
      { text: "打破常規的方法", scores: { PRO: 4, AMA: 3 } },
      { text: "尋找自由的旅程", scores: { LOK: 5, HER: 2 } }
    ]
  },
  {
    id: "Q50",
    chapter: 3,
    text: "如果能立刻學會一件事...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "所有的知識體系", scores: { ATH: 5, ODI: 2 } },
      { text: "所有的情感語言", scores: { APH: 5, FRE: 2 } },
      { text: "所有的創作技能", scores: { PRO: 5, HEP: 2 } },
      { text: "所有的生存本領", scores: { HER: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q51",
    chapter: 3,
    text: "你最大的內在矛盾是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "想要控制又想要放手", scores: { ZEU: 4, LOK: 3 } },
      { text: "想要親密又需要空間", scores: { APH: 4, ODI: 3 } },
      { text: "想要穩定又渴望變化", scores: { HEP: 4, PRO: 3 } },
      { text: "想要帶領又想要自由", scores: { HOR: 4, LOK: 3 } }
    ]
  },
  {
    id: "Q52",
    chapter: 3,
    text: "對你而言，真正的成功是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "透徹理解事物本質", scores: { ATH: 5, ODI: 2 } },
      { text: "活出愛與被愛", scores: { APH: 5, FRE: 2 } },
      { text: "創造獨特的價值", scores: { PRO: 5, HEP: 2 } },
      { text: "完全的自我實現", scores: { LOK: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q53",
    chapter: 3,
    text: "你希望留在世界上的是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "清晰的智慧", scores: { ATH: 5, HOR: 2 } },
      { text: "溫暖的記憶", scores: { APH: 5, FRE: 2 } },
      { text: "創新的突破", scores: { PRO: 5, AMA: 2 } },
      { text: "自由的精神", scores: { LOK: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q54",
    chapter: 3,
    text: "當需要療癒時，你渴望...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "理解問題的根源", scores: { ATH: 4, ODI: 3 } },
      { text: "被無條件地接納", scores: { APH: 5, FRE: 3 } },
      { text: "創造全新的開始", scores: { PRO: 4, AMA: 3 } },
      { text: "回到寧靜的中心", scores: { FRE: 4, ODI: 3 } }
    ]
  },
  {
    id: "Q55",
    chapter: 3,
    text: "你覺得自己隱藏的天賦是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "洞察複雜的能力", scores: { ATH: 5, ODI: 2 } },
      { text: "療癒他人的能力", scores: { FRE: 5, APH: 2 } },
      { text: "引領改變的能力", scores: { HOR: 4, PRO: 3 } },
      { text: "超越限制的能力", scores: { LOK: 4, AMA: 3 } }
    ]
  },
  {
    id: "Q56",
    chapter: 3,
    text: "你和這個世界的關係像...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "觀察者與被觀察的", scores: { ATH: 4, ODI: 3 } },
      { text: "愛人與被愛的", scores: { APH: 5, FRE: 2 } },
      { text: "創造者與畫布", scores: { PRO: 5, HER: 2 } },
      { text: "旅人與風景", scores: { LOK: 5, ISI: 2 } }
    ]
  },
  {
    id: "Q57",
    chapter: 3,
    text: "如果只能實現一個願望...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "擁有究極的智慧", scores: { ATH: 5, ODI: 2 } },
      { text: "體驗完整的愛", scores: { APH: 5, FRE: 2 } },
      { text: "創造不朽的作品", scores: { PRO: 5, HEP: 2 } },
      { text: "獲得絕對的自由", scores: { LOK: 5, AMA: 2 } }
    ]
  },
  {
    id: "Q58",
    chapter: 3,
    text: "你既害怕又渴望的是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "完全的透明真實", scores: { ATH: 4, APH: 3 } },
      { text: "毫無保留的親密", scores: { APH: 5, ODI: 2 } },
      { text: "徹底的改變重生", scores: { PRO: 4, AMA: 3 } },
      { text: "絕對的孤獨自由", scores: { LOK: 5, ODI: 2 } }
    ]
  },
  {
    id: "Q59",
    chapter: 3,
    text: "如果明天是最後一天，你最想...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "留下清晰的指引", scores: { ATH: 4, HOR: 3 } },
      { text: "說出所有的愛", scores: { APH: 5, FRE: 2 } },
      { text: "完成那個瘋狂的夢", scores: { PRO: 5, AMA: 2 } },
      { text: "體驗純粹的存在", scores: { ODI: 4, ISI: 3 } }
    ]
  },
  {
    id: "Q60",
    chapter: 3,
    text: "如果靈魂有顏色，你的是...",
    type: "deep",
    weight: 1.2,
    options: [
      { text: "純淨的銀白", scores: { ATH: 5, ZEU: 2 } },
      { text: "溫暖的玫瑰金", scores: { APH: 5, FRE: 2 } },
      { text: "變幻的極光", scores: { PRO: 5, LOK: 2 } },
      { text: "深邃的靛藍", scores: { ODI: 5, ISI: 2 } }
    ]
  },

  // 第四章：陰影之地 (61-75) - 權重 1.5
  {
    id: "Q61",
    chapter: 4,
    text: "你對自己說的最大謊言是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "我不需要任何人", scores: { ATH: 5, LOK: 3, APH: -2 } },
      { text: "我很好，沒事的", scores: { FRE: 5, ZEU: 2, HER: -2 } },
      { text: "總有一天會...", scores: { ISI: 5, PRO: 2, HEP: -3 } },
      { text: "這樣就夠了", scores: { ZEU: 5, AMA: -3, PRO: -2 } }
    ]
  },
  {
    id: "Q62",
    chapter: 4,
    text: "你最不願承認自己其實...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "也會感到迷茫無助", scores: { ATH: 4, ODI: 3, HOR: -2 } },
      { text: "內心充滿憤怒", scores: { APH: 4, AMA: 4, FRE: -2 } },
      { text: "害怕真正的改變", scores: { PRO: 4, HER: -3, ZEU: 3 } },
      { text: "渴望被人需要", scores: { LOK: 4, HOR: 3, ODI: -2 } }
    ]
  },
  {
    id: "Q63",
    chapter: 4,
    text: "你偽裝得最好的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "你的脆弱", scores: { ATH: 5, APH: -3, HOR: 2 } },
      { text: "你的孤獨", scores: { LOK: 5, FRE: -3, ODI: 2 } },
      { text: "你的恐懼", scores: { HER: 5, ODI: -3, AMA: 2 } },
      { text: "你的疲憊", scores: { HEP: 5, FRE: -3, ZEU: 2 } }
    ]
  },
  {
    id: "Q64",
    chapter: 4,
    text: "在最黑暗的時刻，你會...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "質疑一切的意義", scores: { ATH: 5, ODI: 4, ISI: -2 } },
      { text: "感到徹底的空虛", scores: { APH: 3, FRE: -4, ODI: 3 } },
      { text: "想要毀掉一切重來", scores: { AMA: 5, PRO: 3, ZEU: -3 } },
      { text: "完全地自我封閉", scores: { ODI: 5, APH: -3, LOK: 2 } }
    ]
  },
  {
    id: "Q65",
    chapter: 4,
    text: "你其實很想要，但不敢要的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "完全的掌控", scores: { ZEU: 5, HOR: 4, LOK: -2 } },
      { text: "無條件的愛", scores: { APH: 5, FRE: 3, ATH: -2 } },
      { text: "徹底的自由", scores: { LOK: 5, AMA: 3, HOR: -3 } },
      { text: "絕對的認可", scores: { HOR: 4, ATH: 3, LOK: -2 } }
    ]
  },
  {
    id: "Q66",
    chapter: 4,
    text: "你最深的恐懼是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "失去理智", scores: { ATH: 5, PRO: -3, ZEU: 3 } },
      { text: "不被愛", scores: { APH: 5, LOK: -3, FRE: 2 } },
      { text: "變得平庸", scores: { PRO: 5, AMA: 3, ZEU: -3 } },
      { text: "被困住", scores: { LOK: 5, HER: 3, ZEU: -3 } }
    ]
  },
  {
    id: "Q67",
    chapter: 4,
    text: "你內心最深的傷口關於...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "從未被理解", scores: { ATH: 4, ODI: 4, APH: -2 } },
      { text: "從未被珍惜", scores: { APH: 5, FRE: 3, HOR: -2 } },
      { text: "從未被肯定", scores: { PRO: 4, HOR: 3, FRE: -2 } },
      { text: "從未真正自由", scores: { LOK: 5, ISI: 3, ZEU: -2 } }
    ]
  },
  {
    id: "Q68",
    chapter: 4,
    text: "你假裝不在乎，但其實很在意...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "是否夠聰明", scores: { ATH: 5, HOR: 2, FRE: -2 } },
      { text: "是否被喜歡", scores: { APH: 5, FRE: 2, LOK: -2 } },
      { text: "是否有價值", scores: { HEP: 4, PRO: 3, ISI: -2 } },
      { text: "是否與眾不同", scores: { LOK: 4, PRO: 3, ZEU: -2 } }
    ]
  },
  {
    id: "Q69",
    chapter: 4,
    text: "你一直否認但其實渴望的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "依賴某個人", scores: { APH: 5, LOK: -3, FRE: 3 } },
      { text: "被人照顧", scores: { FRE: 5, HOR: -3, APH: 2 } },
      { text: "停下腳步", scores: { ODI: 5, HER: -3, FRE: 2 } },
      { text: "放棄責任", scores: { LOK: 5, HOR: -4, ISI: 2 } }
    ]
  },
  {
    id: "Q70",
    chapter: 4,
    text: "你一直在逃避的真相是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "你也需要愛", scores: { ATH: 4, APH: 4, LOK: -2 } },
      { text: "你也會軟弱", scores: { HOR: 4, FRE: 4, AMA: -2 } },
      { text: "你也想安定", scores: { LOK: 4, ZEU: 4, PRO: -2 } },
      { text: "你也會害怕", scores: { AMA: 4, ODI: 4, HER: -2 } }
    ]
  },
  {
    id: "Q71",
    chapter: 4,
    text: "你內心的小孩還在...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "等待被認可", scores: { HOR: 4, ATH: 3, FRE: -2 } },
      { text: "渴望被擁抱", scores: { APH: 5, FRE: 4, LOK: -1 } },
      { text: "想要去冒險", scores: { AMA: 5, LOK: 3, ZEU: -2 } },
      { text: "需要被保護", scores: { FRE: 5, ZEU: 3, AMA: -2 } }
    ]
  },
  {
    id: "Q72",
    chapter: 4,
    text: "你一直放不下的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "對完美的執著", scores: { ATH: 5, ZEU: 4, LOK: -2 } },
      { text: "對愛的執念", scores: { APH: 5, ISI: 3, ODI: -2 } },
      { text: "對自由的堅持", scores: { LOK: 5, AMA: 3, ZEU: -2 } },
      { text: "對意義的追尋", scores: { ODI: 5, ISI: 4, HER: -2 } }
    ]
  },
  {
    id: "Q73",
    chapter: 4,
    text: "夜深人靜，你會突然覺得...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "一切都是徒勞", scores: { ATH: 4, ODI: 5, ISI: -3 } },
      { text: "無比的孤單", scores: { APH: 4, FRE: -4, LOK: 3 } },
      { text: "時間在流逝", scores: { HER: 4, AMA: 3, FRE: -3 } },
      { text: "自己好渺小", scores: { ODI: 4, ISI: 3, HOR: -3 } }
    ]
  },
  {
    id: "Q74",
    chapter: 4,
    text: "如果人生可以重來，你最想改變的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "少一點理性分析", scores: { ATH: 5, APH: -3, HER: 2 } },
      { text: "多一點勇敢表達", scores: { APH: 5, ODI: -3, HER: 2 } },
      { text: "早一點開始行動", scores: { HER: 5, ODI: -3, AMA: 2 } },
      { text: "少一點在意他人", scores: { LOK: 5, HOR: -3, FRE: 2 } }
    ]
  },
  {
    id: "Q75",
    chapter: 4,
    text: "對你來說，最難說出口的是...",
    type: "shadow",
    weight: 1.5,
    options: [
      { text: "我不知道", scores: { ATH: 5, HOR: -3, ODI: 2 } },
      { text: "我需要你", scores: { LOK: 5, APH: -3, FRE: 2 } },
      { text: "我錯了", scores: { HOR: 5, ODI: -3, ATH: 2 } },
      { text: "我害怕", scores: { AMA: 5, FRE: -3, HER: 2 } }
    ]
  },

  // 第五章：靈魂核心 (76-85) - 權重 2.0
  {
    id: "Q76",
    chapter: 5,
    text: "如果生命只剩一天，你會發現最重要的是...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "留下了什麼智慧", scores: { ATH: 5, HOR: 4, ODI: 2 } },
      { text: "愛過和被愛過", scores: { APH: 6, FRE: 5, ISI: 1 } },
      { text: "活出了真實的自己", scores: { LOK: 6, PRO: 4, ISI: 2 } },
      { text: "經歷了想要的一切", scores: { AMA: 6, HER: 4, ISI: 2 } }
    ]
  },
  {
    id: "Q77",
    chapter: 5,
    text: "撕掉所有標籤後，你的本質是...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "永恆的觀察者", scores: { ATH: 6, ODI: 5, HER: -2 } },
      { text: "無盡的愛", scores: { APH: 6, FRE: 5, ATH: -2 } },
      { text: "不滅的火焰", scores: { PRO: 6, AMA: 5, ZEU: -2 } },
      { text: "自由的風", scores: { LOK: 6, ISI: 4, ZEU: -2 } }
    ]
  },
  {
    id: "Q78",
    chapter: 5,
    text: "如果宇宙問你'你是誰'，你會說...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "我是尋找答案的問題", scores: { ATH: 5, ODI: 6, ISI: 2 } },
      { text: "我是連結一切的愛", scores: { APH: 6, FRE: 5, HOR: 1 } },
      { text: "我是創造可能的力量", scores: { PRO: 6, HER: 4, AMA: 2 } },
      { text: "我是自由流動的意識", scores: { LOK: 6, ISI: 5, ODI: 2 } }
    ]
  },
  {
    id: "Q79",
    chapter: 5,
    text: "在生命盡頭，你最想聽到的是...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "你的智慧照亮了道路", scores: { ATH: 6, HOR: 4, ODI: 2 } },
      { text: "你的愛溫暖了世界", scores: { APH: 6, FRE: 5, HOR: 1 } },
      { text: "你的勇氣改變了一切", scores: { AMA: 6, PRO: 4, HER: 2 } },
      { text: "你活出了自己", scores: { LOK: 6, ISI: 4, PRO: 2 } }
    ]
  },
  {
    id: "Q80",
    chapter: 5,
    text: "如果只能給世界留下一樣東西...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "清晰的真理", scores: { ATH: 6, ODI: 4, HOR: 2 } },
      { text: "無條件的愛", scores: { APH: 6, FRE: 5, ISI: 1 } },
      { text: "突破的勇氣", scores: { AMA: 6, PRO: 5, LOK: 1 } },
      { text: "自由的精神", scores: { LOK: 6, ISI: 4, PRO: 2 } }
    ]
  },
  {
    id: "Q81",
    chapter: 5,
    text: "對你而言，存在的意義是...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "理解一切的本質", scores: { ATH: 6, ODI: 5, ISI: 2 } },
      { text: "成為愛的載體", scores: { APH: 6, FRE: 5, HOR: 1 } },
      { text: "創造獨特的印記", scores: { PRO: 6, HEP: 4, HOR: 2 } },
      { text: "體驗完整的自由", scores: { LOK: 6, ISI: 5, AMA: 1 } }
    ]
  },
  {
    id: "Q82",
    chapter: 5,
    text: "如果必須遺忘一切，你最想保留的感覺是...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "明白的瞬間", scores: { ATH: 6, ODI: 4, ISI: 2 } },
      { text: "被愛的溫度", scores: { APH: 6, FRE: 5, HOR: 1 } },
      { text: "創造的狂喜", scores: { PRO: 6, AMA: 4, HER: 2 } },
      { text: "自由的感覺", scores: { LOK: 6, ISI: 4, ODI: 2 } }
    ]
  },
  {
    id: "Q83",
    chapter: 5,
    text: "你的靈魂最終想要回到...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "純粹的智慧之光", scores: { ATH: 6, ODI: 5, ZEU: 1 } },
      { text: "愛的源頭", scores: { APH: 6, FRE: 6, ISI: 1 } },
      { text: "創造的起點", scores: { PRO: 6, ISI: 5, AMA: 1 } },
      { text: "無限的自由", scores: { LOK: 6, ODI: 4, ISI: 2 } }
    ]
  },
  {
    id: "Q84",
    chapter: 5,
    text: "你感到最真實的自己是當...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "洞察真相的瞬間", scores: { ATH: 6, ODI: 5, APH: -1 } },
      { text: "全然去愛的時候", scores: { APH: 6, FRE: 5, ATH: -1 } },
      { text: "突破限制的時刻", scores: { AMA: 6, PRO: 5, ZEU: -1 } },
      { text: "完全自由的狀態", scores: { LOK: 6, ISI: 5, HOR: -1 } }
    ]
  },
  {
    id: "Q85",
    chapter: 5,
    text: "如果這是你對自己說的最後一句話...",
    type: "soul",
    weight: 2.0,
    options: [
      { text: "你已經找到答案了", scores: { ATH: 6, ODI: 5, HOR: 2 } },
      { text: "你一直都值得被愛", scores: { APH: 6, FRE: 6, ISI: 1 } },
      { text: "你的存在改變了什麼", scores: { PRO: 6, HOR: 5, AMA: 1 } },
      { text: "你終於自由了", scores: { LOK: 6, ISI: 5, ODI: 2 } }
    ]
  }
]

// 章節標題和描述
export const chapters = {
  1: {
    title: "晨光初現",
    subtitle: "表層自我",
    description: "像剝洋蔥的外層，從簡單的開始...",
    restStation: "深呼吸三次，準備進入下一層"
  },
  2: {
    title: "日常面具",
    subtitle: "社會人格",
    description: "你每天扮演的角色...",
    restStation: "站起來伸展，喝口水，感受此刻"
  },
  3: {
    title: "內在渴望",
    subtitle: "理想自我",
    description: "那些你渴望但不敢說的...",
    restStation: "換個姿勢，也許換個精油的香氣"
  },
  4: {
    title: "陰影之地",
    subtitle: "壓抑面向",
    description: "可能會觸動你，這很正常",
    restStation: "把手放在心上，感謝自己的勇敢"
  },
  5: {
    title: "靈魂核心",
    subtitle: "本質真我",
    description: "最深處的真實...",
    restStation: "謝謝你的信任，你的英靈正在甦醒..."
  }
}