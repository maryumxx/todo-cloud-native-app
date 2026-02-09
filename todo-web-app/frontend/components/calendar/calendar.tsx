'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { Event, Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  events: Event[]
  tasks: Task[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: Event) => void
  onTaskClick?: (task: Task) => void
}

export function Calendar({
  events,
  tasks,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time)
      return isSameDay(eventStart, date)
    })
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      return isSameDay(new Date(task.due_date), date)
    })
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            <HiChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <HiChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="ml-2"
          >
            Today
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.h2
            key={format(currentMonth, 'yyyy-MM')}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-lg font-semibold"
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h2>
        </AnimatePresence>

        <div className="w-[120px]" /> {/* Spacer for balance */}
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div
        key={format(currentMonth, 'yyyy-MM')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-7"
      >
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const dayTasks = getTasksForDate(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0

          return (
            <motion.div
              key={index}
              onClick={() => onDateClick?.(day)}
              whileHover={{ backgroundColor: 'var(--muted)' }}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-border cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                index % 7 === 6 && 'border-r-0'
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors',
                    isCurrentDay && 'bg-primary text-primary-foreground',
                    !isCurrentDay && hasItems && 'bg-primary/10 text-primary'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md truncate cursor-pointer transition-colors',
                      'bg-primary/15 text-primary hover:bg-primary/25 font-medium'
                    )}
                  >
                    {event.title}
                  </motion.div>
                ))}

                {/* Tasks with due date */}
                {dayTasks.slice(0, 2 - Math.min(dayEvents.length, 2)).map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md truncate',
                      task.is_completed
                        ? 'bg-success/15 text-success line-through'
                        : 'bg-warning/15 text-warning'
                    )}
                  >
                    {task.title}
                  </motion.div>
                ))}

                {/* More indicator */}
                {dayEvents.length + dayTasks.length > 2 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    +{dayEvents.length + dayTasks.length - 2} more
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default Calendar
