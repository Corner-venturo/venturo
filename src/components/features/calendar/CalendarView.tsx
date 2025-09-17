'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, DateClickArg } from '@fullcalendar/core'
import { Button } from '@/components/catalyst/button'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { CalendarEvent } from '@/types/calendar'
import { CalendarAPI } from '@/lib/api/calendar'
import { format } from 'date-fns'
import { useGlobalStore } from '@/stores/globalStore'

interface CalendarViewProps {
  mode: 'life' | 'work'
}

export default function CalendarView({ mode }: CalendarViewProps) {
  const router = useRouter()
  const { user } = useGlobalStore()
  const calendarRef = useRef<FullCalendar>(null)

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  })

  // 事件詳情對話框
  const [eventDialog, setEventDialog] = useState<{
    open: boolean
    event: CalendarEvent | null
  }>({
    open: false,
    event: null
  })

  // 更多事件對話框
  const [moreEventsDialog, setMoreEventsDialog] = useState<{
    open: boolean
    date: string
    events: CalendarEvent[]
  }>({
    open: false,
    date: '',
    events: []
  })

  // 載入事件
  const loadEvents = async () => {
    setLoading(true)
    try {
      const startDate = format(dateRange.start, 'yyyy-MM-dd')
      const endDate = format(dateRange.end, 'yyyy-MM-dd')

      const result = await CalendarAPI.getEvents(startDate, endDate, mode)

      if (result.success) {
        setEvents(result.data)
      } else {
        console.error('Failed to load events:', result.error)
        setEvents([])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
    }
    setLoading(false)
  }

  // 當日期範圍或模式變更時重新載入
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, dateRange, mode])

  // 處理日期點擊 - 導向新增待辦
  const handleDateClick = (info: DateClickArg) => {
    const selectedDate = format(info.date, 'yyyy-MM-dd')
    router.push(`/todos?date=${selectedDate}&mode=${mode}`)
  }

  // 處理事件點擊
  const handleEventClick = (info: EventClickArg) => {
    const event = info.event
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      extendedProps: event.extendedProps as CalendarEvent['extendedProps']
    }

    setEventDialog({
      open: true,
      event: calendarEvent
    })
  }

  // 處理日期範圍變更
  const handleDatesSet = (dateInfo: any) => {
    setDateRange({
      start: dateInfo.start,
      end: dateInfo.end
    })
  }

  // 處理更多連結點擊
  const handleMoreLinkClick = (info: any) => {
    info.jsEvent.preventDefault()

    const clickedDate = format(info.date, 'yyyy-MM-dd')

    // 取得當天的所有事件
    const dayEvents = events.filter(event => {
      const eventDate = event.start.split('T')[0]
      return eventDate === clickedDate
    })

    setMoreEventsDialog({
      open: true,
      date: clickedDate,
      events: dayEvents
    })

    return 'none'
  }

  // 關閉對話框
  const handleCloseEventDialog = () => {
    setEventDialog({ open: false, event: null })
  }

  const handleCloseMoreDialog = () => {
    setMoreEventsDialog({ open: false, date: '', events: [] })
  }

  // 處理事件導航
  const handleEventNavigation = (event: CalendarEvent) => {
    if (event.extendedProps?.type === 'todo' && event.extendedProps.todoId) {
      router.push(`/todos?id=${event.extendedProps.todoId}`)
    } else if (event.extendedProps?.type === 'project' && event.extendedProps.projectId) {
      router.push(`/projects/${event.extendedProps.projectId}`)
    }
    handleCloseEventDialog()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 統計資訊 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {events.length} 個事件
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>待辦</span>
          </div>
          {mode === 'work' && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>專案</span>
            </div>
          )}
        </div>
      </div>

      {/* 日曆 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          locale="zh-tw"
          height="auto"
          dayMaxEvents={3}
          moreLinkClick={handleMoreLinkClick}
          moreLinkText="更多"
          weekends={true}
          eventDisplay="block"
          displayEventTime={false}
          eventClassNames={(arg) => {
            const type = arg.event.extendedProps?.type
            return `calendar-event-${type}`
          }}
        />
      </div>

      {/* 事件詳情對話框 */}
      <Dialog open={eventDialog.open} onClose={handleCloseEventDialog} size="lg">
        <DialogTitle>事件詳情</DialogTitle>
        <DialogBody>
          {eventDialog.event && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">標題</div>
                <div className="text-lg font-semibold">{eventDialog.event.title}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">日期</div>
                <div>{format(new Date(eventDialog.event.start), 'yyyy年MM月dd日')}</div>
              </div>

              {eventDialog.event.extendedProps?.description && (
                <div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">描述</div>
                  <div className="text-sm">{eventDialog.event.extendedProps.description}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">類型</div>
                <div className="text-sm">
                  {eventDialog.event.extendedProps?.type === 'todo' && '待辦事項'}
                  {eventDialog.event.extendedProps?.type === 'project' && '專案'}
                  {eventDialog.event.extendedProps?.type === 'event' && '事件'}
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={handleCloseEventDialog}>
            關閉
          </Button>
          {eventDialog.event && (
            <Button onClick={() => handleEventNavigation(eventDialog.event!)}>
              前往詳情
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 更多事件對話框 */}
      <Dialog open={moreEventsDialog.open} onClose={handleCloseMoreDialog} size="lg">
        <DialogTitle>
          {moreEventsDialog.date} 的所有事件 ({moreEventsDialog.events.length})
        </DialogTitle>
        <DialogBody>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {moreEventsDialog.events.map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
                onClick={() => {
                  setEventDialog({ open: true, event })
                  handleCloseMoreDialog()
                }}
              >
                <div
                  className="w-3 h-3 rounded flex-shrink-0"
                  style={{ backgroundColor: event.backgroundColor || '#6B7280' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {event.extendedProps?.type === 'todo' && '待辦事項'}
                    {event.extendedProps?.type === 'project' && '專案'}
                    {event.extendedProps?.type === 'event' && '事件'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={handleCloseMoreDialog}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        .fc-event {
          cursor: pointer;
          border: none;
          font-size: 12px;
          padding: 4px 6px;
          border-radius: 4px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        .fc-day-today {
          background-color: rgba(59, 130, 246, 0.05) !important;
        }

        .fc-daygrid-day:hover {
          background-color: rgba(0, 0, 0, 0.02);
          cursor: pointer;
        }

        .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc-popover {
          display: none !important;
        }

        .fc-daygrid-more-link {
          color: #3B82F6 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
          display: inline-block !important;
          margin-top: 2px !important;
        }

        .fc-daygrid-more-link:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #2563EB !important;
        }

        .calendar-event-todo {
          background-color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }

        .calendar-event-project {
          background-color: #10B981 !important;
          border-color: #10B981 !important;
        }

        .calendar-event-event {
          background-color: #8B5CF6 !important;
          border-color: #8B5CF6 !important;
        }
      `}</style>
    </div>
  )
}