'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/catalyst/button'
import { Dialog, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Badge } from '@/components/catalyst/badge'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

// 類型定義
type BoxType = 'general' | 'timer' | 'skincare' | 'workout' | 'reminder'
type BoxStatus = 'planned' | 'completed' | 'skipped' | 'in_progress'

interface TimeBox {
  id: string
  title: string
  type: BoxType
  dayOfWeek: number // 0-6 (週一到週日)
  startTime: string // "09:00"
  duration: number // 分鐘
  status: BoxStatus
  color?: string
  data?: any
}

export default function TimeboxPage() {
  const [boxes, setBoxes] = useState<TimeBox[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<{day: number, time: string} | null>(null)
  const [selectedBox, setSelectedBox] = useState<TimeBox | null>(null)
  const [isAddBoxOpen, setIsAddBoxOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 統計數據
  const stats = {
    totalBoxes: boxes.length,
    completedBoxes: boxes.filter(box => box.status === 'completed').length,
    inProgressBoxes: boxes.filter(box => box.status === 'in_progress').length,
    plannedBoxes: boxes.filter(box => box.status === 'planned').length
  }

  // 簡化的週視圖組件
  const WeekView = () => {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    const hours = Array.from({ length: 16 }, (_, i) => 6 + i) // 6:00 到 21:00

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              週時間表
            </h3>
            <div className="flex items-center space-x-2">
              <Button plain onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentWeek.toLocaleDateString()}
              </span>
              <Button plain onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 簡化的格子視圖 */}
          <div className="grid grid-cols-8 gap-1 text-xs">
            {/* 標題列 */}
            <div></div>
            {days.map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-700 dark:text-gray-300">
                {day}
              </div>
            ))}

            {/* 時間格子 */}
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="p-2 text-right text-gray-500 dark:text-gray-400">
                  {hour}:00
                </div>
                {days.map((_, dayIndex) => {
                  const timeKey = `${hour.toString().padStart(2, '0')}:00`
                  const box = boxes.find(b => b.dayOfWeek === dayIndex && b.startTime === timeKey)

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`
                        h-12 border border-gray-200 dark:border-gray-600 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                        ${box ? 'bg-blue-100 dark:bg-blue-900' : ''}
                      `}
                      onClick={() => {
                        if (box) {
                          setSelectedBox(box)
                          setIsDetailOpen(true)
                        } else {
                          setSelectedSlot({ day: dayIndex, time: timeKey })
                          setIsAddBoxOpen(true)
                        }
                      }}
                    >
                      {box && (
                        <div className="p-1">
                          <div className="text-xs font-medium truncate">
                            {box.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {box.duration}分
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 新增箱子對話框
  const AddBoxDialog = () => {
    const [title, setTitle] = useState('')
    const [duration, setDuration] = useState(60)
    const [type, setType] = useState<BoxType>('general')

    const handleAdd = () => {
      if (!selectedSlot || !title) return

      const newBox: TimeBox = {
        id: `box-${Date.now()}`,
        title,
        type,
        dayOfWeek: selectedSlot.day,
        startTime: selectedSlot.time,
        duration,
        status: 'planned'
      }

      setBoxes(prev => [...prev, newBox])
      setIsAddBoxOpen(false)
      setSelectedSlot(null)
      setTitle('')
      setDuration(60)
      setType('general')
    }

    return (
      <Dialog open={isAddBoxOpen} onClose={() => setIsAddBoxOpen(false)}>
        <DialogBody>
          <h3 className="text-lg font-semibold mb-4">新增時間箱</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">標題</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="輸入活動標題"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">持續時間（分鐘）</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">類型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as BoxType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="general">一般</option>
                <option value="timer">計時</option>
                <option value="skincare">護膚</option>
                <option value="workout">運動</option>
                <option value="reminder">提醒</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsAddBoxOpen(false)}>取消</Button>
          <Button onClick={handleAdd}>新增</Button>
        </DialogActions>
      </Dialog>
    )
  }

  // 詳情對話框
  const DetailDialog = () => {
    if (!selectedBox) return null

    return (
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)}>
        <DialogBody>
          <h3 className="text-lg font-semibold mb-4">{selectedBox.title}</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">類型: {selectedBox.type}</p>
            <p className="text-sm text-gray-600">時間: {selectedBox.startTime}</p>
            <p className="text-sm text-gray-600">持續: {selectedBox.duration}分鐘</p>
            <p className="text-sm text-gray-600">狀態: {selectedBox.status}</p>
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => {
            setBoxes(prev => prev.filter(box => box.id !== selectedBox.id))
            setIsDetailOpen(false)
          }}>刪除</Button>
          <Button onClick={() => setIsDetailOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <div className="h-full">
      {/* 標題區域 - 遵循統一規範 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">箱型時間</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              時間管理工具，將你的時間切分成有意義的片段
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setIsAddBoxOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              新增時間箱
            </Button>
          </div>
        </div>

        {/* 統計 badges */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">總時間箱</span>
            <Badge color="blue">{stats.totalBoxes}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">已完成</span>
            <Badge color="green">{stats.completedBoxes}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <PlayIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">進行中</span>
            <Badge color="orange">{stats.inProgressBoxes}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">計劃中</span>
            <Badge color="gray">{stats.plannedBoxes}</Badge>
          </div>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        <div className="px-8 py-6">
          <WeekView />
        </div>
      </div>

      {/* 對話框 */}
      <AddBoxDialog />
      <DetailDialog />
    </div>
  )
}