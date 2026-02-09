'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlus,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
} from 'react-icons/hi2'
import { Task } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { SortableTaskList } from '@/components/tasks/sortable-task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { MotionButton, Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ProgressRing } from '@/components/ui/progress-ring'
import {
  GradientCard,
  GradientCardHeader,
  GradientCardTitle,
  GradientCardDescription,
  GradientCardContent,
} from '@/components/ui/gradient-card'

const TaskListPage: React.FC = () => {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchTasks()

    // Listen for task updates from chat widget
    const handleTasksUpdated = () => {
      fetchTasks()
    }
    window.addEventListener('tasks-updated', handleTasksUpdated)
    return () => window.removeEventListener('tasks-updated', handleTasksUpdated)
  }, [router])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTasks()

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const sortedTasks = [...response.data].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        )
        setTasks(sortedTasks)
      }
    } catch (err) {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: completed } : t))
    )

    try {
      const response = await apiClient.updateTask(taskId, {
        is_completed: completed,
      })
      if (response.error) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, is_completed: !completed } : t
          )
        )
        setError(response.error)
      }
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_completed: !completed } : t
        )
      )
      setError('Failed to update task')
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    const taskToDelete = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const response = await apiClient.deleteTask(taskId)
      if (response.error) {
        if (taskToDelete) {
          setTasks((prev) => [...prev, taskToDelete])
        }
        setError(response.error)
      }
    } catch (err) {
      if (taskToDelete) {
        setTasks((prev) => [...prev, taskToDelete])
      }
      setError('Failed to delete task')
    }
  }

  const handleReorder = async (taskIds: string[]) => {
    const reorderedTasks = taskIds
      .map((id, index) => {
        const task = tasks.find((t) => t.id === id)
        return task ? { ...task, position: index } : null
      })
      .filter(Boolean) as Task[]

    const previousTasks = [...tasks]
    setTasks(reorderedTasks)

    try {
      const response = await apiClient.reorderTasks(taskIds)
      if (response.error) {
        setTasks(previousTasks)
        setError(response.error)
      }
    } catch (err) {
      setTasks(previousTasks)
      setError('Failed to reorder tasks')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleCreateTask = async (title: string, description?: string) => {
    const response = await apiClient.createTask(title, description)
    if (response.data) {
      setTasks((prev) => [...prev, response.data!])
      setShowCreateModal(false)
    } else if (response.error) {
      throw new Error(response.error)
    }
  }

  const handleUpdateTask = async (title: string, description?: string) => {
    if (!editingTask) return
    const response = await apiClient.updateTask(editingTask.id, {
      title,
      description,
    })
    if (response.data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? response.data! : t))
      )
      setEditingTask(null)
    } else if (response.error) {
      throw new Error(response.error)
    }
  }

  // Calculate stats
  const completedTasks = tasks.filter((t) => t.is_completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-muted-foreground">Loading your tasks...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <motion.h1
            className="text-2xl md:text-3xl font-bold gradient-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Tasks
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Manage and track your daily activities
          </motion.p>
        </div>
        <MotionButton
          onClick={() => setShowCreateModal(true)}
          variant="gradient"
          size="lg"
          leftIcon={<HiPlus className="h-5 w-5" />}
          className="hidden sm:flex"
        >
          Add Task
        </MotionButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GradientCard variant="glass" padding="sm" animated hover="lift">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={completionRate}
              size="sm"
              variant="gradient"
              showValue={false}
            />
            <div>
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="glass" padding="sm" animated hover="lift">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <HiExclamationTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTasks - completedTasks}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="glass" padding="sm" animated hover="lift">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HiCheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
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

      {/* Task List */}
      <GradientCard variant="default" padding="none" className="overflow-hidden">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <HiCheckCircle className="h-10 w-10 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Get started by creating your first task. Stay organized and
              productive!
            </p>
            <MotionButton
              onClick={() => setShowCreateModal(true)}
              variant="gradient"
              leftIcon={<HiPlus className="h-5 w-5" />}
            >
              Create your first task
            </MotionButton>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <SortableTaskList
              tasks={tasks}
              onReorder={handleReorder}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        )}
      </GradientCard>

      {/* Mobile FAB */}
      <FloatingActionButton
        className="sm:hidden"
        onClick={() => setShowCreateModal(true)}
        icon={<HiPlus className="h-6 w-6" />}
        label="Add Task"
      />

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
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
                    <GradientCardTitle>Create New Task</GradientCardTitle>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <HiXMark className="h-5 w-5" />
                    </button>
                  </div>
                  <GradientCardDescription>
                    Add a new task to your list
                  </GradientCardDescription>
                </GradientCardHeader>
                <GradientCardContent>
                  <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowCreateModal(false)}
                  />
                </GradientCardContent>
              </GradientCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
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
                    <GradientCardTitle>Edit Task</GradientCardTitle>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <HiXMark className="h-5 w-5" />
                    </button>
                  </div>
                  <GradientCardDescription>
                    Update your task details
                  </GradientCardDescription>
                </GradientCardHeader>
                <GradientCardContent>
                  <TaskForm
                    initialTitle={editingTask.title}
                    initialDescription={editingTask.description || ''}
                    onSubmit={handleUpdateTask}
                    onCancel={() => setEditingTask(null)}
                    submitLabel="Update Task"
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

export default TaskListPage
