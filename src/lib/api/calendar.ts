import { supabase } from '@/lib/supabase/client'
import { CalendarEvent, CalendarEventInput, todoToCalendarEvent, projectToCalendarEvent } from '@/types/calendar'

export class CalendarAPI {
  // 獲取日曆事件
  static async getEvents(startDate: string, endDate: string, mode: 'life' | 'work' | 'all' = 'all') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const events: CalendarEvent[] = []

      // 獲取行事曆事件
      let eventsQuery = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate)
        .lte('start_time', endDate + 'T23:59:59')

      if (mode !== 'all') {
        eventsQuery = eventsQuery.eq('mode', mode)
      }

      const { data: calendarEvents, error: eventsError } = await eventsQuery

      if (eventsError) {
        console.warn('Failed to fetch calendar events:', eventsError)
      } else if (calendarEvents) {
        // 轉換為 CalendarEvent 格式
        const formattedEvents = calendarEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          allDay: event.all_day,
          backgroundColor: event.color || '#6B7280',
          extendedProps: {
            type: 'event' as const,
            description: event.description,
            mode: event.mode,
            userId: event.user_id
          }
        }))
        events.push(...formattedEvents)
      }

      // 獲取有到期日的待辦事項
      let todosQuery = supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .not('due_date', 'is', null)
        .gte('due_date', startDate)
        .lte('due_date', endDate)

      if (mode !== 'all') {
        todosQuery = todosQuery.eq('mode', mode)
      }

      const { data: todos, error: todosError } = await todosQuery

      if (todosError) {
        console.warn('Failed to fetch todos:', todosError)
      } else if (todos) {
        const todoEvents = todos.map(todoToCalendarEvent)
        events.push(...todoEvents)
      }

      // 如果是工作模式或全部模式，獲取專案
      if (mode === 'work' || mode === 'all') {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .not('start_date', 'is', null)
          .gte('start_date', startDate)
          .lte('start_date', endDate)

        if (projectsError) {
          console.warn('Failed to fetch projects:', projectsError)
        } else if (projects) {
          const projectEvents = projects.map(projectToCalendarEvent)
          events.push(...projectEvents)
        }
      }

      return { success: true, data: events }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // 創建日曆事件
  static async createEvent(eventData: CalendarEventInput) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to create calendar event:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // 更新日曆事件
  static async updateEvent(eventId: string, eventData: Partial<CalendarEventInput>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to update calendar event:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // 刪除日曆事件
  static async deleteEvent(eventId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to delete calendar event:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}