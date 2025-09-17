'use client'

import { useEffect, useState } from 'react'
import { VenturoCard } from '@/components/VenturoCard'
import { SpiritProfile, TestSession } from '@/lib/soulmagic/types'
import { gods } from '@/lib/soulmagic/gods'
import { saveSpiritProfile } from '@/lib/supabase/spirit-profiles'

interface SpiritResultProps {
  profile: SpiritProfile
  session: TestSession
}

export function SpiritResult({ profile, session }: SpiritResultProps) {
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const primaryGod = gods[profile.threeHighs.primary.code]
  const secondaryGod = gods[profile.threeHighs.secondary.code]
  const tertiaryGod = gods[profile.threeHighs.tertiary.code]

  const mainShadow = gods[profile.twoLows.mainShadow.code]
  const secondShadow = gods[profile.twoLows.secondShadow.code]

  const testDuration = session.completedAt && session.startTime
    ? Math.round((session.completedAt.getTime() - session.startTime.getTime()) / 1000 / 60)
    : 0

  // 自動儲存結果
  useEffect(() => {
    const saveResult = async () => {
      try {
        await saveSpiritProfile(profile, session)
        setSaved(true)
      } catch (error) {
        console.error('Failed to save spirit profile:', error)
        setSaveError('儲存結果時發生錯誤，但你的英靈DNA已生成')
      }
    }

    if (!saved && !saveError) {
      saveResult()
    }
  }, [profile, session, saved, saveError])

  return (
    <div className="flex flex-col px-[15px] py-8 space-y-8">
      {/* 標題和概述 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          你的英靈已甦醒
        </h1>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 mb-4">
          <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-3">🧬 你的英靈DNA序號</h3>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-600">
            <div className="font-mono text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-3">
              {profile.id}
            </div>
            <div className="text-center space-y-2">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(profile.id)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  } catch (err) {
                    console.error('複製失敗:', err)
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors mr-3 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {copied ? '✅ 已複製' : '📋 複製序號'}
              </button>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
                <p className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                  📸 請截圖此頁面並傳給威廉
                </p>
                <p>威廉會根據你的DNA序號為你量身打造專屬英靈！</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          測驗時間：{testDuration} 分鐘
        </p>
        <div className="text-xs mt-2">
          {saved && (
            <span className="text-green-600 dark:text-green-400">✓ 英靈DNA已永久記錄</span>
          )}
          {saveError && (
            <span className="text-orange-600 dark:text-orange-400">⚠ {saveError}</span>
          )}
          {!saved && !saveError && (
            <span className="text-zinc-400">正在記錄英靈DNA...</span>
          )}
        </div>
      </div>

      {/* 英靈孵化狀態 */}
      <VenturoCard variant="gradient" className="text-center max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">🥚 英靈孵化中</h2>

            {/* 孵化動畫區域 */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </div>

              {/* 魔法光圈 */}
              <div className="absolute -inset-4 rounded-full border-2 border-purple-300/30 animate-ping"></div>
              <div className="absolute -inset-8 rounded-full border border-pink-300/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              你的英靈正在甦醒中...
            </h3>
            <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
              基於你的靈魂 DNA：{primaryGod.name}、{secondaryGod.name}、{tertiaryGod.name}<br/>
              我們正在為你量身打造獨一無二的英靈伙伴
            </p>

            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-lg mb-4">孵化進度</h4>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>DNA 序號解析完成</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>三高英靈能量確定</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>陰影面向識別完成</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-500 animate-spin">⚡</span>
                  <span>英靈外觀生成中...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-400">○</span>
                  <span className="text-zinc-400">性格本質塑造中...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-400">○</span>
                  <span className="text-zinc-400">成長預言編織中...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-400">○</span>
                  <span className="text-zinc-400">靈魂詩籤創作中...</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚡ 重要！立即行動 ⚡
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-3">
                    📱 現在就截圖這個頁面<br/>
                    📨 將截圖傳送給威廉<br/>
                    🧬 確保包含你的DNA序號：<strong>{profile.id}</strong>
                  </p>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    沒有截圖就無法為你生成專屬英靈喔！
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  💫 預計孵化時間：24-48小時<br/>
                  🔔 英靈甦醒後將自動通知你
                </p>
              </div>
            </div>
          </div>
        </div>
      </VenturoCard>

      {/* 次要英靈 */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <VenturoCard variant="default">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-3">次要英靈</h3>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: secondaryGod.color }}
            >
              {secondaryGod.code}
            </div>
            <h4 className="text-xl font-bold mb-2">{secondaryGod.name}</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              {secondaryGod.coreEnergy}
            </p>
            <div className="text-2xl font-bold text-purple-500">
              {profile.threeHighs.secondary.normalized}
            </div>
          </div>
        </VenturoCard>

        <VenturoCard variant="default">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-3">隱藏英靈</h3>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: tertiaryGod.color }}
            >
              {tertiaryGod.code}
            </div>
            <h4 className="text-xl font-bold mb-2">{tertiaryGod.name}</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              {tertiaryGod.coreEnergy}
            </p>
            <div className="text-2xl font-bold text-purple-500">
              {profile.threeHighs.tertiary.normalized}
            </div>
          </div>
        </VenturoCard>
      </div>

      {/* 陰影面向 */}
      <VenturoCard variant="default" className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-4">陰影面向</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            這些不是缺點，而是需要關注和平衡的面向
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-sm font-bold opacity-60"
              style={{ backgroundColor: mainShadow.color }}
            >
              {mainShadow.code}
            </div>
            <h4 className="font-bold mb-2">{mainShadow.name}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
              當失衡時可能出現：{mainShadow.deficiencySymptoms}
            </p>
            <div className="text-lg font-bold text-zinc-400">
              {profile.twoLows.mainShadow.normalized}
            </div>
          </div>

          <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-sm font-bold opacity-60"
              style={{ backgroundColor: secondShadow.color }}
            >
              {secondShadow.code}
            </div>
            <h4 className="font-bold mb-2">{secondShadow.name}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
              當失衡時可能出現：{secondShadow.deficiencySymptoms}
            </p>
            <div className="text-lg font-bold text-zinc-400">
              {profile.twoLows.secondShadow.normalized}
            </div>
          </div>
        </div>
      </VenturoCard>

      {/* 完整神祇光譜 */}
      <VenturoCard variant="default" className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-center">你的完整神祇光譜</h3>
        <div className="space-y-3">
          {[
            profile.threeHighs.primary,
            profile.threeHighs.secondary,
            profile.threeHighs.tertiary,
            ...profile.middleGods,
            profile.twoLows.mainShadow,
            profile.twoLows.secondShadow
          ].map((godScore, index) => {
            const god = gods[godScore.code]
            return (
              <div key={godScore.code} className="flex items-center space-x-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: god.color }}
                  >
                    {god.code}
                  </div>
                  <div>
                    <div className="font-medium">{god.name}</div>
                    <div className="text-sm text-zinc-500">{god.coreEnergy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{godScore.normalized}</div>
                  <div className="w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: god.color,
                        width: `${godScore.normalized}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </VenturoCard>

      {/* 重新測驗按鈕 */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
        >
          重新探索靈魂
        </button>
      </div>
    </div>
  )
}