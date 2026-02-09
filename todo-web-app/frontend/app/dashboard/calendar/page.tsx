'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiXMark, HiCalendarDays, HiTrash } from 'react-icons/hi2'
import { Calendar } from '@/components/calendar/calendar'
import { EventForm } from '@/components/calendar/event-form'
import { apiClient } from '@/lib/api-client'
import { Event, EventCreate, Task } from '@/lib/types'
import { MotionButton, Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import {
  GradientCard,
  GradientCardHeader,
  GradientCardTitle,
  GradientCardDescription,
  GradientCardContent,
} from '@/components/ui/gradient-card'

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        apiClient.getEvents(),
        apiClient.getTasks(),
      ])

      if (eventsRes.data) {
        setEvents(eventsRes.data)
      }
      if (tasksRes.data) {
        setTasks(tasksRes.data)
      }
    } catch (err) {
      setError('Failed to load calendar data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowEventForm(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setShowEventForm(true)
  }

  const handleCreateEvent = async (data: EventCreate) => {
    const result = await apiClient.createEvent(data)
    if (result.data) {
      setEvents([...events, result.data])
      setShowEventForm(false)
      setSelectedDate(null)
    } else if (result.error) {
      throw new Error(result.error)
    }
  }

  const handleUpdateEvent = async (data: EventCreate) => {
    if (!selectedEvent) return
    const result = await apiClient.updateEvent(selectedEvent.id, data)
    if (result.data) {
      setEvents(events.map((e) => (e.id === selectedEvent.id ? result.data! : e)))
      setShowEventForm(false)
      setSelectedEvent(null)
    } else if (result.error) {
      throw new Error(result.error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    const result = await apiClient.deleteEvent(selectedEvent.id)
    if (!result.error) {
      setEvents(events.filter((e) => e.id !== selectedEvent.id))
      setShowEventForm(false)
      setSelectedEvent(null)
    }
  }

  const formatDateTimeForInput = (date: Date) => {
    return date.toISOString().slice(0, 16)
  }

  // Stats
  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) > new Date()
  ).length
  const tasksWithDueDate = tasks.filter((t) => t.due_date).length

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <motion.h1
            className="text-2xl md:text-3xl font-bold gradient-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Calendar
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Schedule and manage your events
          </motion.p>
        </div>
        <MotionButton
          onClick={() => {
            setSelectedEvent(null)
            setSelectedDate(new Date())
            setShowEventForm(true)
          }}
          variant="gradient"
          size="lg"
          leftIcon={<HiPlus className="h-5 w-5" />}
          className="hidden sm:flex"
        >
          Add Event
        </MotionButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GradientCard variant="glass" padding="sm" animated hover="lift">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HiCalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingEvents}</p>
              <p className="text-xs text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="glass" padding="sm" animated hover="lift">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <HiCalendarDays className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasksWithDueDate}</p>
              <p className="text-xs text-muted-foreground">Tasks with Due Date</p>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <GradientCard variant="default" padding="default" className="overflow-hidden">
        <Calendar
          events={events}
          tasks={tasks}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </GradientCard>

      {/* Mobile FAB */}
      <FloatingActionButton
        className="sm:hidden"
        onClick={() => {
          setSelectedEvent(null)
          setSelectedDate(new Date())
          setShowEventForm(true)
        }}
        icon={<HiPlus className="h-6 w-6" />}
        label="Add Event"
      />

      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEventForm(false)
              setSelectedEvent(null)
              setSelectedDate(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GradientCard variant="default" padding="lg" className="w-full max-w-md">
                <GradientCardHeader>
                  <div className="flex items-center justify-between">
                    <GradientCardTitle>
                      {selectedEvent ? 'Edit Event' : 'New Event'}
                    </GradientCardTitle>
                    <div className="flex items-center gap-2">
                      {selectedEvent && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleDeleteEvent}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <HiTrash className="h-5 w-5" />
                        </Button>
                      )}
                      <button
                        onClick={() => {
                          setShowEventForm(false)
                          setSelectedEvent(null)
                          setSelectedDate(null)
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <HiXMark className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <GradientCardDescription>
                    {selectedEvent
                      ? 'Update your event details'
                      : 'Create a new event on your calendar'}
                  </GradientCardDescription>
                </GradientCardHeader>
                <GradientCardContent>
                  <EventForm
                    initialData={
                      selectedEvent
                        ? {
                            title: selectedEvent.title,
                            description: selectedEvent.description || '',
                            start_time: selectedEvent.start_time.slice(0, 16),
                            end_time: selectedEvent.end_time.slice(0, 16),
                          }
                        : selectedDate
                        ? {
                            title: '',
                            description: '',
                            start_time: formatDateTimeForInput(selectedDate),
                            end_time: formatDateTimeForInput(
                              new Date(selectedDate.getTime() + 60 * 60 * 1000)
                            ),
                          }
                        : undefined
                    }
                    onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
                    onCancel={() => {
                      setShowEventForm(false)
                      setSelectedEvent(null)
                      setSelectedDate(null)
                    }}
                    isEditing={!!selectedEvent}
                  />
                </GradientCardContent>
              </GradientCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
