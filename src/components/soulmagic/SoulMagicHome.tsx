'use client'

import { useState } from 'react'
import { VenturoCard } from '@/components/VenturoCard'
import SoulTest from './SoulTest'

export default function SoulMagicHome() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <SoulTest />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-[15px] py-8">
      <VenturoCard variant="gradient" className="text-center max-w-3xl">
        <div className="space-y-8">
          {/* 標題 */}
          <div>
            <h1 className="text-4xl font-bold mb-4">
              心靈魔法
            </h1>
            <h2 className="text-2xl font-semibold text-purple-100 mb-6">
              Soul Magic
            </h2>
            <p className="text-lg text-purple-100/90 leading-relaxed">
              這不是普通的測驗<br/>
              而是與你靈魂深處的對話<br/>
              一場發現真實自我的神聖儀式
            </p>
          </div>

          {/* 特色介紹 */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-bold text-purple-100 mb-2">🌟 12 神祇英靈系統</h3>
              <p className="text-sm text-purple-200/80">
                每個人都有獨特的神祇組合，不是對立而是共生
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-bold text-purple-100 mb-2">🎭 三高二低分析</h3>
              <p className="text-sm text-purple-200/80">
                發現你的主導特質與需要關注的陰影面向
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-bold text-purple-100 mb-2">🌙 流暢互動體驗</h3>
              <p className="text-sm text-purple-200/80">
                85 題深度探索，點擊答案即進入下一題，可隨時返回修改
              </p>
            </div>
          </div>

          {/* 準備事項 */}
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-bold text-purple-100 mb-4">🕯️ 開始前的準備</h3>
            <div className="text-left space-y-2 text-sm text-purple-200/90">
              <p>• 找一個安靜不被打擾的空間</p>
              <p>• 點一支蠟燭或精油，營造神聖感</p>
              <p>• 預留 20-30 分鐘的完整時間</p>
              <p>• 準備好與內心深處的自己對話</p>
            </div>
          </div>

          {/* 重要提醒 */}
          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-xl p-4">
            <h3 className="font-bold text-yellow-100 mb-2">⚠️ 溫馨提醒</h3>
            <p className="text-sm text-yellow-200/90">
              這個測驗會觸及你的深層情感和陰影面向<br/>
              如果感到不適，隨時可以暫停<br/>
              每個答案都沒有對錯，只要誠實面對自己
            </p>
          </div>

          {/* 開始按鈕 */}
          <div className="pt-4">
            <button
              onClick={() => setStarted(true)}
              className="px-12 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              我準備好了，開始靈魂之旅
            </button>
          </div>

          <p className="text-sm text-purple-200/70">
            "當你凝視深淵時，深淵也在凝視你<br/>
            但不要害怕，因為那正是你自己"
          </p>
        </div>
      </VenturoCard>
    </div>
  )
}