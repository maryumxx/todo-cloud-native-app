'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  HiBars3,
  HiPencilSquare,
  HiTrash,
  HiCheckCircle,
} from 'react-icons/hi2'
import { Task } from '@/lib/types'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SortableTaskItemProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  disabled?: boolean
}

function SortableTaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  disabled = false,
}: SortableTaskItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: prefersReducedMotion ? undefined : transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'group flex items-center gap-3 p-4 bg-card hover:bg-muted/50 transition-colors',
        isDragging && 'shadow-lg z-50 rounded-xl border border-primary'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-lg transition-colors opacity-50 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <HiBars3 className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Custom Checkbox */}
      <button
        onClick={() => onToggleComplete(task.id, !task.is_completed)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
          task.is_completed
            ? 'bg-success border-success text-white'
            : 'border-muted-foreground/30 hover:border-primary'
        )}
        aria-label={`Mark "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
      >
        {task.is_completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <HiCheckCircle className="h-4 w-4" />
          </motion.div>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium transition-all duration-200',
            task.is_completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
        >
          <HiPencilSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(task.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Delete "${task.title}"`}
        >
          <HiTrash className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

interface SortableTaskListProps {
  tasks: Task[]
  onReorder: (taskIds: string[]) => void
  onToggleComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
}

export function SortableTaskList({
  tasks,
  onReorder,
  onToggleComplete,
  onDelete,
  onEdit,
}: SortableTaskListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
      onReorder(reorderedTasks.map((t) => t.id))
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </AnimatePresence>
      </SortableContext>

      {!prefersReducedMotion && (
        <DragOverlay>
          {activeTask ? (
            <motion.div
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 bg-card border-2 border-primary rounded-xl shadow-glow"
            >
              <div className="p-1.5">
                <HiBars3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{activeTask.title}</p>
                {activeTask.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {activeTask.description}
                  </p>
                )}
              </div>
            </motion.div>
          ) : null}
        </DragOverlay>
      )}
    </DndContext>
  )
}

export default SortableTaskList
