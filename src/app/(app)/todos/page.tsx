'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/catalyst/button'
import { Checkbox } from '@/components/catalyst/checkbox'
import { supabase } from '@/lib/supabase/client'
import { useGlobalStore } from '@/stores/globalStore'
import { AddTodoDialog } from './AddTodoDialog'
import { TodoDetailDialog } from './TodoDetailDialog'
import { PlusIcon, TrashIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline'

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
}

export default function TodosPage() {
  const { user, currentMode, features } = useGlobalStore()

  // 狀態管理 - 簡化版本，直接使用全域狀態
  const [allTodos, setAllTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed' | 'project'>('pending')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([])
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)

  // 載入待辦事項 - 只在 user 改變時載入
  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  // 根據分頁篩選待辦事項
  const filteredTodos = useMemo(() => {
    if (activeTab === 'project') {
      // 專案分頁顯示所有未分組的任務
      return allTodos.filter(todo => !todo.project_id)
    }
    
    // 其他分頁根據狀態篩選
    const statusMap = {
      'pending': 'pending',
      'in_progress': 'in_progress',
      'completed': 'completed'
    }
    
    return allTodos.filter(todo => todo.status === statusMap[activeTab])
  }, [allTodos, activeTab])

  // 計算各狀態數量
  const statusCounts = useMemo(() => {
    return {
      pending: allTodos.filter(t => t.status === 'pending').length,
      in_progress: allTodos.filter(t => t.status === 'in_progress').length,
      completed: allTodos.filter(t => t.status === 'completed').length,
      unassigned: allTodos.filter(t => !t.project_id).length
    }
  }, [allTodos])

  // 判斷是否需要雙欄顯示
  const shouldShowTwoColumns = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1440 && filteredTodos.length > 3
  }, [filteredTodos])

  // 分配左右欄的待辦事項
  const { leftColumnTodos, rightColumnTodos } = useMemo(() => {
    if (!shouldShowTwoColumns) {
      return { leftColumnTodos: filteredTodos, rightColumnTodos: [] }
    }
    
    const midPoint = Math.ceil(filteredTodos.length / 2)
    return {
      leftColumnTodos: filteredTodos.slice(0, midPoint),
      rightColumnTodos: filteredTodos.slice(midPoint)
    }
  }, [filteredTodos, shouldShowTwoColumns])

  const loadTodos = async () => {
    setLoading(true)


    // 載入所有個人待辦事項
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user?.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading todos:', error)
    } else {
      setAllTodos(data || [])
    }
    setLoading(false)
  }

  // 新增待辦事項（樂觀更新）
  const addTodo = async (todoData: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date: string | null
  }) => {
    if (!user) return

    const tempId = `temp-${Date.now()}`
    const tempTodo: Todo = {
      id: tempId,
      title: todoData.title,
      description: todoData.description || null,
      status: 'pending',
      priority: todoData.priority,
      due_date: todoData.due_date,
      project_id: null,
      is_private: true, // 個人待辦預設私人
      created_at: new Date().toISOString()
    }
    
    // 樂觀更新 - 立即顯示新待辦
    setAllTodos([tempTodo, ...allTodos])

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title: todoData.title,
        description: todoData.description || null,
        status: 'pending',
        priority: todoData.priority,
        due_date: todoData.due_date,
        is_private: true // 個人待辦預設私人
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding todo:', error)
      // 如果失敗，移除暫時的待辦
      setAllTodos(todos => todos.filter(t => t.id !== tempId))
      alert('新增失敗，請重試')
    } else if (data) {
      // 用實際資料替換暫時的待辦
      setAllTodos(todos => todos.map(t => 
        t.id === tempId ? data : t
      ))
    }
  }

  // 更新待辦事項 - 優化版本
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    // 樂觀更新
    const originalTodos = [...allTodos]
    setAllTodos(todos => todos.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates }
        : todo
    ))

    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating todo:', error)
      // 回滾到原本的狀態
      setAllTodos(originalTodos)
      alert('更新失敗，請重試')
    }
  }

  // 更新待辦狀態（樂觀更新）
  const updateStatus = async (id: string, newStatus: Todo['status']) => {
    setAllTodos(todos => todos.map(todo => 
      todo.id === id 
        ? { ...todo, status: newStatus }
        : todo
    ))

    const { error } = await supabase
      .from('todos')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
      await loadTodos()
    }
  }

  // 刪除待辦事項（樂觀更新）
  const deleteTodo = async (id: string) => {
    const todoToDelete = allTodos.find(t => t.id === id)
    
    setAllTodos(todos => todos.filter(todo => todo.id !== id))

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      if (todoToDelete) {
        setAllTodos(todos => [...todos, todoToDelete])
      }
      alert('刪除失敗，請重試')
    }
  }

  // 開啟詳情對話框
  const openDetailDialog = (todo: Todo) => {
    if (!isSelectMode) {
      setSelectedTodo(todo)
      setIsDetailDialogOpen(true)
    }
  }

  // 切換選擇狀態
  const toggleTodoSelection = (todoId: string) => {
    setSelectedTodoIds(prev => 
      prev.includes(todoId)
        ? prev.filter(id => id !== todoId)
        : [...prev, todoId]
    )
  }

  // 進入/退出選擇模式
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedTodoIds([])
    }
  }

  // 建立專案
  const createProject = () => {
    if (selectedTodoIds.length === 0) {
      alert('請選擇至少一個任務')
      return
    }
    setIsCreateProjectDialogOpen(true)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
  }

  // TodoCard 元件 - 新設計（修正 hover 按鈕位置）
  const TodoCard = ({ todo }: { todo: Todo }) => {
    const isSelected = selectedTodoIds.includes(todo.id)
    
    return (
      <div
        className={`
          group relative flex items-center gap-3 rounded-lg border bg-white p-4 
          transition-all cursor-pointer
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-zinc-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800'
          }
        `}
        onClick={() => {
          if (isSelectMode) {
            toggleTodoSelection(todo.id)
          } else {
            openDetailDialog(todo)
          }
        }}
      >
        {/* 選擇模式的勾選框 */}
        {isSelectMode && (
          <Checkbox
            checked={isSelected}
            onChange={() => toggleTodoSelection(todo.id)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        )}
        
        {/* 主要內容 */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            {/* 左側：標題和描述 */}
            <div className="flex-1">
              <p className={`font-medium ${
                todo.status === 'completed' 
                  ? 'text-zinc-400 line-through dark:text-zinc-500' 
                  : 'text-zinc-900 dark:text-white'
              }`}>
                {todo.title}
              </p>
              {todo.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {todo.description}
                </p>
              )}
            </div>

            {/* 右側：優先級和日期 + hover 按鈕 */}
            <div className="flex items-center gap-2">
              {/* hover 操作按鈕 - 簡化版 */}
              {!isSelectMode && (
                <div 
                  className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => updateStatus(todo.id, 'completed')}
                    className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                    title="完成"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(todo.id, 'in_progress')}
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="進行中"
                  >
                    <ClockIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="刪除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* 優先級和日期資訊 */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-lg">{getPriorityIcon(todo.priority)}</span>
                {todo.due_date && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    📅 {new Date(todo.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 分頁標籤 - 新設計
  const tabs = [
    { key: 'pending' as const, label: '待執行', count: statusCounts.pending },
    { key: 'in_progress' as const, label: '進行中', count: statusCounts.in_progress },
    { key: 'completed' as const, label: '完成', count: statusCounts.completed },
  ]

  // 工作模式加入專案分頁
  if (currentMode === 'work') {
    tabs.push({ key: 'project' as const, label: '專案', count: statusCounts.unassigned })
  }

  return (
    <div className="h-full">
      {/* 標題區域 - 有內距 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              待辦事項
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              管理您的任務與目標
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            新增待辦
          </Button>
        </div>
      </div>

      {/* 分頁區域 - 滿版對齊 */}
      <div className="mx-auto max-w-6xl">
        {/* 分頁標籤 - 滿版延伸 */}
        <div className="border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setIsSelectMode(false)
                  setSelectedTodoIds([])
                }}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${activeTab === tab.key
                    ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.key
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 內容區域 - 有內距 */}
        <div className="px-8 py-6">
          {/* 專案分頁的選擇模式控制 */}
          {activeTab === 'project' && (
            <div className="mb-4 flex items-center justify-between">
              {isSelectMode ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    選擇要打包的任務 (已選 {selectedTodoIds.length} 個)
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={toggleSelectMode} outline size="sm">
                      取消
                    </Button>
                    <Button onClick={createProject} size="sm">
                      建立專案
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    所有未分組任務
                  </p>
                  <Button onClick={toggleSelectMode} size="sm">
                    選擇並建立專案
                  </Button>
                </>
              )}
            </div>
          )}

          {/* 任務列表 */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-zinc-500">載入中...</div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                {activeTab === 'project'
                  ? '所有任務都已分組到專案'
                  : `沒有${tabs.find(t => t.key === activeTab)?.label}的事項`}
              </p>
            </div>
          ) : shouldShowTwoColumns ? (
            // 雙欄顯示
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                {leftColumnTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
              </div>
              <div className="space-y-2">
                {rightColumnTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          ) : (
            // 單欄顯示
            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 新增待辦對話框 */}
      <AddTodoDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addTodo}
      />

      {/* 待辦詳情對話框 */}
      <TodoDetailDialog
        todo={selectedTodo}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false)
          setSelectedTodo(null)
        }}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
      />
    </div>
  )
}
