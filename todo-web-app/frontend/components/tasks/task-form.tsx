'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiDocumentText, HiPencil } from 'react-icons/hi2'
import { Input, Textarea } from '@/components/ui/input'
import { FormField } from '@/components/ui/label'
import { Button, MotionButton } from '@/components/ui/button'

interface TaskFormProps {
  initialTitle?: string
  initialDescription?: string
  onSubmit: (title: string, description?: string) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function TaskForm({
  initialTitle = '',
  initialDescription = '',
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(title.trim(), description.trim() || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
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
          placeholder="What needs to be done?"
          leftIcon={<HiPencil className="h-5 w-5" />}
          inputSize="lg"
          autoFocus
          required
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details (optional)"
          rows={3}
        />
      </FormField>

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
          {isSubmitting ? 'Saving...' : submitLabel}
        </MotionButton>
      </div>
    </form>
  )
}

export default TaskForm
