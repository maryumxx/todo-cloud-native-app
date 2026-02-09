'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCalendarDays, HiClock, HiDocumentText } from 'react-icons/hi2'
import { EventCreate } from '@/lib/types'
import { Input, Textarea } from '@/components/ui/input'
import { FormField } from '@/components/ui/label'
import { Button, MotionButton } from '@/components/ui/button'

interface EventFormProps {
  initialData?: {
    title: string
    description: string
    start_time: string
    end_time: string
  }
  onSubmit: (data: EventCreate) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startTime, setStartTime] = useState(initialData?.start_time || '')
  const [endTime, setEndTime] = useState(initialData?.end_time || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!startTime || !endTime) {
      setError('Start and end times are required')
      return
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startTime,
        end_time: endTime,
      })
    } catch (err) {
      setError('Failed to save event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <p className="text-sm text-destructive font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <FormField label="Title" required>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          leftIcon={<HiCalendarDays className="h-5 w-5" />}
          inputSize="lg"
          required
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description (optional)"
          rows={3}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start Time" required>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            leftIcon={<HiClock className="h-5 w-5" />}
            inputSize="lg"
            required
          />
        </FormField>

        <FormField label="End Time" required>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            leftIcon={<HiClock className="h-5 w-5" />}
            inputSize="lg"
            required
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <MotionButton
          type="submit"
          variant="gradient"
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <HiDocumentText className="h-5 w-5" /> : undefined}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </MotionButton>
      </div>
    </form>
  )
}

export default EventForm
