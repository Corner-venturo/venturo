'use client'

import { useState } from 'react'
import { Button } from '@/components/catalyst/button'
import { VenturoCard } from '@/components/VenturoCard'
import SoulTest from '@/components/soulmagic/SoulTest'

export default function SoulMagicPage() {
  const [started, setStarted] = useState(false)

  return (
    <div className="h-full">
      {/* 標題區域 - 遵循統一規範 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">心靈魔法</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              探索你的內在世界，發現真實自我的神聖之旅
            </p>
          </div>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        <div className="px-8 py-6">
          {started ? (
            <SoulTest />
          ) : (
            <div className="flex justify-center">
              <VenturoCard variant="gradient" className="text-center max-w-3xl">
                <div className="space-y-8">
                  {/* 副標題 */}
                  <div>
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
                        直覺式操作，讓你專注在內心的聲音
                      </p>
                    </div>
                  </div>

                  {/* 開始按鈕 */}
                  <div className="pt-6">
                    <Button
                      onClick={() => setStarted(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    >
                      🌟 開始靈魂之旅
                    </Button>
                  </div>
                </div>
              </VenturoCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
