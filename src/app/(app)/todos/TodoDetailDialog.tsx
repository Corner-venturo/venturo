'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Textarea } from '@/components/catalyst/textarea'

interface Todo {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  project_id: string | null
  is_private: boolean
  created_at: string
  notes?: string | null
}

interface TodoDetailDialogProps {
  todo: Todo | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onDelete: (id: string) => void
}

export function TodoDetailDialog({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: TodoDetailDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 當 todo 變化時，更新表單狀態
  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '')
      setDescription(todo.description || '')
      setPriority(todo.priority || 'medium')
      setDueDate(todo.due_date ? todo.due_date.split('T')[0] : '')
      setStatus(todo.status || 'pending')
    }
  }, [todo])

  const handleSave = async () => {
    if (!todo) return

    setIsSubmitting(true)
    try {
      await onUpdate(todo.id, {
        title,
        description: description || null,
        priority,
        due_date: dueDate || null,
        status
      })
      onClose()
    } catch (error) {
      console.error('Error updating todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!todo) return

    if (confirm('確定要刪除這個待辦事項嗎？')) {
      try {
        await onDelete(todo.id)
        onClose()
      } catch (error) {
        console.error('Error deleting todo:', error)
      }
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setStatus('pending')
    onClose()
  }

  if (!todo) return null

  return (
    <Dialog open={isOpen} onClose={handleClose} size="2xl">
      <DialogBody>
        <div className="grid grid-cols-2 gap-6">
          {/* 左側：基本資訊 */}
          <div className="space-y-4 border-r border-zinc-200 pr-6 dark:border-zinc-700">
            {/* 標題 */}
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="標題"
              className="text-lg font-medium"
              required
            />

            {/* 描述 */}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述"
              rows={2}
            />

            {/* 優先級、狀態、截止日期 */}
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="urgent">🔴 緊急</option>
                <option value="high">🟠 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🟢 低</option>
              </Select>

              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="pending">待辦</option>
                <option value="in_progress">進行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </Select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* 右側：預留給未來擴展功能 */}
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">更多功能即將推出...</p>
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button
          type="button"
          plain
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        >
          刪除
        </Button>
        <Button
          type="button"
          plain
          onClick={handleClose}
        >
          取消
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? '儲存中...' : '儲存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}