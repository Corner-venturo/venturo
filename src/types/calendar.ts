export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  color?: string
  backgroundColor?: string
  extendedProps?: {
    type: 'todo' | 'project' | 'birthday' | 'event'
    todoId?: string
    projectId?: string
    userId?: string
    description?: string
    mode?: 'life' | 'work'
    priority?: 'low' | 'medium' | 'high'
  }
}

export interface CalendarEventInput {
  title: string
  description?: string
  start_time: string
  end_time?: string
  type: string
  mode: 'life' | 'work'
  user_id: string
}

export const CalendarEventModel = (data: Partial<CalendarEvent>): CalendarEvent => {
  return {
    id: data.id || '',
    title: data.title || '',
    start: data.start || new Date().toISOString(),
    end: data.end,
    allDay: data.allDay ?? true,
    color: data.color,
    backgroundColor: data.backgroundColor,
    extendedProps: data.extendedProps || { type: 'event' }
  }
}

// 生成一致的顏色
function generateEventColor(type: string, id?: string): string {
  const colorPalette = {
    todo: '#3B82F6', // 藍色
    project: '#10B981', // 綠色
    birthday: '#EF4444', // 紅色
    event: '#8B5CF6', // 紫色
  }

  const baseColor = colorPalette[type as keyof typeof colorPalette] || '#6B7280'

  if (!id) return baseColor

  // 根據 ID 生成稍微不同的色調
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 先返回基本顏色，之後可以添加亮度調整邏輯
  return baseColor
}

// 待辦事項介面 (簡化版用於日曆轉換)
interface TodoForCalendar {
  id: string
  title: string
  due_date?: string | Date
  created_at: string | Date
  description?: string
  mode?: string
  priority?: string | number
  user_id: string
}

// 將待辦事項轉換為日曆事件
export const todoToCalendarEvent = (todo: TodoForCalendar): CalendarEvent => {
  // 確保日期格式正確
  const startDate = todo.due_date ?
    (typeof todo.due_date === 'string' ? todo.due_date : todo.due_date.toISOString()) :
    (typeof todo.created_at === 'string' ? todo.created_at : todo.created_at.toISOString())

  return {
    id: `todo-${todo.id}`,
    title: todo.title,
    start: startDate,
    allDay: true,
    backgroundColor: generateEventColor('todo', todo.id),
    extendedProps: {
      type: 'todo',
      todoId: todo.id,
      description: todo.description,
      mode: todo.mode,
      priority: todo.priority,
      userId: todo.user_id
    }
  }
}

// 專案介面 (簡化版用於日曆轉換)
interface ProjectForCalendar {
  id: string
  name: string
  start_date: string
  end_date?: string
  description?: string
  status?: string
  manager?: string
}

// 將專案轉換為日曆事件
export const projectToCalendarEvent = (project: ProjectForCalendar): CalendarEvent => {
  return {
    id: `project-${project.id}`,
    title: project.name,
    start: project.start_date,
    end: project.end_date,
    allDay: true,
    backgroundColor: generateEventColor('project', project.id),
    extendedProps: {
      type: 'project',
      projectId: project.id,
      description: project.description,
      mode: 'work',
      userId: project.owner_id
    }
  }
}