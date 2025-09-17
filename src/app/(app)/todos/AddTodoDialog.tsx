'use client'

import { useState } from 'react'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Textarea } from '@/components/catalyst/textarea'
import { Field, Label } from '@/components/catalyst/fieldset'

interface AddTodoDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (todo: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date: string | null
  }) => void
}

export function AddTodoDialog({ isOpen, onClose, onAdd }: AddTodoDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || '',
        priority,
        due_date: dueDate || null
      })

      // 重置表單
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          新增待辦事項
        </DialogTitle>
        <DialogDescription>
          建立新的任務並設定優先級
        </DialogDescription>

        <DialogBody>
          <div className="space-y-4">
            {/* 標題 */}
            <Field>
              <Label htmlFor="title">標題 *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入任務標題..."
                autoFocus
                required
              />
            </Field>

            {/* 描述 */}
            <Field>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="新增詳細說明..."
                rows={3}
              />
            </Field>

            {/* 優先級 */}
            <Field>
              <Label htmlFor="priority">優先級</Label>
              <Select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="urgent">🔴 緊急</option>
                <option value="high">🟠 高優先</option>
                <option value="medium">🟡 中優先</option>
                <option value="low">🟢 低優先</option>
              </Select>
            </Field>

            {/* 截止日期 */}
            <Field>
              <Label htmlFor="due_date">截止日期</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </Field>

            {/* 工作模式特有欄位（預留） - 不顯示模式差異 */}
            {mode === 'work' && (
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  專案關聯、指派成員等功能即將推出
                </p>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogActions>
          <Button
            type="button"
            plain
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? '新增中...' : '新增'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
