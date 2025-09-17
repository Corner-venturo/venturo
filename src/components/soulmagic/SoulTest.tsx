'use client'

import { useState, useEffect } from 'react'
import { VenturoCard } from '@/components/VenturoCard'
import { questions, chapters } from '@/lib/soulmagic/questions'
import { calculateSpiritProfile } from '@/lib/soulmagic/calculator'
import { TestAnswer, TestSession, SpiritProfile } from '@/lib/soulmagic/types'
import { SpiritResult } from './SpiritResult'

export default function SoulTest() {
  const [session, setSession] = useState<TestSession>({
    id: `session_${Date.now()}`,
    answers: [],
    currentQuestion: 0,
    startTime: new Date()
  })

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  const [profile, setProfile] = useState<SpiritProfile | null>(null)
  const [showRestStation, setShowRestStation] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)

  const currentQ = questions[session.currentQuestion]
  const progress = ((session.currentQuestion + 1) / questions.length) * 100
  const currentChapter = currentQ?.chapter || 1
  const isLastQuestion = session.currentQuestion === questions.length - 1

  // 當切換到不同題目時，設置該題目的預選答案
  useEffect(() => {
    if (currentQ) {
      const existingAnswer = session.answers.find(a => a.questionId === currentQ.id)
      setSelectedOption(existingAnswer ? existingAnswer.selectedOption : null)
    }
  }, [session.currentQuestion, currentQ, session.answers])

  // 檢查是否該顯示休息站
  const shouldShowRestStation = () => {
    return currentQ && [20, 40, 60, 75].includes(session.currentQuestion)
  }

  const handleAnswer = (optionIndex: number) => {
    if (!currentQ || isAnswering) return

    setSelectedOption(optionIndex)
    setIsAnswering(true)

    // 短暫延遲讓用戶看到選擇效果
    setTimeout(() => {
      const responseTime = Date.now() - questionStartTime.getTime()
      const answer: TestAnswer = {
        questionId: currentQ.id,
        selectedOption: optionIndex,
        responseTime,
        changed: false
      }

      // 更新或替換當前題目的答案
      const newAnswers = [...session.answers]
      const existingIndex = newAnswers.findIndex(a => a.questionId === currentQ.id)

      if (existingIndex >= 0) {
        newAnswers[existingIndex] = { ...answer, changed: true }
      } else {
        newAnswers.push(answer)
      }

      if (isLastQuestion) {
        // 完成測驗，計算結果
        const finalProfile = calculateSpiritProfile(newAnswers, questions)
        setSession({
          ...session,
          answers: newAnswers,
          completedAt: new Date(),
          profile: finalProfile
        })
        setProfile(finalProfile)
      } else {
        // 繼續下一題
        const newCurrentQuestion = session.currentQuestion + 1
        setSession({
          ...session,
          answers: newAnswers,
          currentQuestion: newCurrentQuestion
        })

        // 檢查是否需要休息站
        if ([20, 40, 60, 75].includes(newCurrentQuestion)) {
          setShowRestStation(true)
        } else {
          nextQuestion()
        }
      }

      setIsAnswering(false)
    }, 500)
  }

  const nextQuestion = () => {
    setQuestionStartTime(new Date())
    setShowRestStation(false)
    setIsAnswering(false)
    // selectedOption 將由 useEffect 自動設置
  }

  const goToPreviousQuestion = () => {
    if (session.currentQuestion > 0) {
      const newCurrentQuestion = session.currentQuestion - 1
      setSession({
        ...session,
        currentQuestion: newCurrentQuestion
      })
      setQuestionStartTime(new Date())
      setShowRestStation(false)
      setIsAnswering(false)
      // selectedOption 將由 useEffect 自動設置
    }
  }

  const continueFromRestStation = () => {
    nextQuestion()
  }

  // 如果測驗完成，顯示結果
  if (profile) {
    return <SpiritResult profile={profile} session={session} />
  }

  // 休息站
  if (showRestStation) {
    const chapterInfo = chapters[currentChapter]
    return (
      <div className="flex h-full flex-col items-center justify-center px-[15px] py-8">
        <VenturoCard variant="gradient" className="text-center max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">
            休息站 {currentChapter}
          </h2>
          <div className="prose prose-lg text-center mb-8">
            <p className="text-lg leading-relaxed whitespace-pre-line">
              {chapterInfo.restStation}
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={continueFromRestStation}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
            >
              準備好了，繼續
            </button>
          </div>
        </VenturoCard>
      </div>
    )
  }

  // 測驗進行中
  if (!currentQ) return null

  return (
    <div className="flex h-full flex-col px-[15px] py-8">
      {/* 進度條 */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {chapters[currentChapter].title} • 第 {session.currentQuestion + 1} 題，共 {questions.length} 題
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題卡片 */}
      <div className="flex-1 flex items-center justify-center">
        <VenturoCard variant="default" className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-4 leading-relaxed whitespace-pre-line">
              {currentQ.text}
            </h1>
          </div>

          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswering}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                  selectedOption === index
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : isAnswering
                    ? 'border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-60'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${
                    selectedOption === index
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {selectedOption === index && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  <span className="text-base">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={session.currentQuestion === 0 || isAnswering}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                session.currentQuestion > 0 && !isAnswering
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              ← 上一題
            </button>

            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {isAnswering ? '正在處理...' : '點擊任一選項即可進入下一題'}
            </div>

            <div className="w-24"></div> {/* 平衡左側按鈕 */}
          </div>
        </VenturoCard>
      </div>
    </div>
  )
}