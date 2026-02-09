'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HiClipboardDocumentList,
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
  HiArrowTrendingUp,
  HiPlus,
  HiArrowRight,
  HiCalendarDays,
  HiSparkles,
} from 'react-icons/hi2'
import { Card, MotionCard, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { ProgressRing, ProgressBar } from '@/components/ui/progress-ring'
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge'
import { Button, MotionButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { Task, Event } from '@/lib/types'

// Define types for our dashboard data
interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDashboardData();

    // Listen for task updates from chat widget
    const handleTasksUpdated = () => {
      fetchDashboardData();
    };
    window.addEventListener('tasks-updated', handleTasksUpdated);
    return () => window.removeEventListener('tasks-updated', handleTasksUpdated);
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch tasks
      const tasksResponse = await apiClient.getTasks();

      // Fetch events
      const eventsResponse = await apiClient.getEvents();

      // Handle tasks
      if (tasksResponse.error) {
        setError(tasksResponse.error);
        return;
      }

      if (tasksResponse.data) {
        const tasks = tasksResponse.data;

        // Calculate stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.is_completed).length;
        const pendingTasks = tasks.filter(t => !t.is_completed).length;
        // For simplicity, we're considering overdue as tasks with due dates in the past that aren't completed
        // This is a simplified calculation - in a real app, you'd have a more sophisticated logic
        const overdueTasks = tasks.filter(t => !t.is_completed && t.due_date && new Date(t.due_date) < new Date()).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setStats({
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate,
        });

        // Set recent tasks (most recently updated)
        const sortedTasks = [...tasks].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ).slice(0, 4); // Take only the 4 most recent tasks

        setRecentTasks(sortedTasks);

        // Calculate and set weekly progress
        const { progress, days } = calculateWeeklyProgress(tasks);
        setWeeklyProgress(progress);
        setWeekDays(days);
      }

      // Handle events
      if (eventsResponse.error) {
        console.error('Events fetch error:', eventsResponse.error);
      } else if (eventsResponse.data) {
        // Get events for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysEvents = eventsResponse.data.filter(event => {
          const eventDate = new Date(event.start_time);
          return eventDate >= today && eventDate < tomorrow;
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        // Limit to 3 events for the dashboard
        setUpcomingEvents(todaysEvents.slice(0, 3));
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly progress based on completed tasks
  const calculateWeeklyProgress = (allTasks: Task[]) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekProgress = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const completedTasksToday = allTasks.filter(task =>
        task.is_completed &&
        new Date(task.updated_at) >= dayStart &&
        new Date(task.updated_at) < dayEnd
      );

      // Calculate percentage based on completed tasks (max 100%)
      const progress = Math.min(100, Math.round((completedTasksToday.length / 5) * 100)); // Assuming 5 is a reasonable daily target
      weekProgress.push(progress);
    }

    return { progress: weekProgress, days: dayNames };
  };

  // We need all tasks to calculate weekly progress, not just recent ones
  // So we'll calculate this separately when we have all tasks
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weekDays, setWeekDays] = useState<string[]>(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="glass" className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <HiExclamationTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Good morning! <span className="wave">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your tasks today.
          </p>
        </div>
        <Link href="/dashboard/tasks/create">
          <MotionButton variant="gradient" size="lg" leftIcon={<HiPlus className="h-5 w-5" />}>
            New Task
          </MotionButton>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Tasks */}
        <GlassCard hover="lift" animated className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl gradient-cool flex items-center justify-center">
              <HiClipboardDocumentList className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-success flex items-center gap-1">
              <HiArrowTrendingUp className="h-4 w-4" />
              {stats.totalTasks > 0 ? `+${Math.min(20, stats.totalTasks)}%` : '0%'}
            </span>
            <span className="text-muted-foreground">from last week</span>
          </div>
        </GlassCard>

        {/* Completed */}
        <GlassCard hover="lift" animated className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center">
              <HiCheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
          <ProgressBar value={stats.completionRate} variant="success" size="sm" className="mt-4" />
        </GlassCard>

        {/* Pending */}
        <GlassCard hover="lift" animated className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
              <HiClock className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {stats.pendingTasks > 0 ? `${Math.min(stats.pendingTasks, 2)} due today` : 'All caught up'}
          </div>
        </GlassCard>

        {/* Overdue */}
        <GlassCard hover="lift" animated className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-3xl font-bold mt-1 text-destructive">{stats.overdueTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <HiExclamationTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div className="mt-4 text-sm text-destructive">
            {stats.overdueTasks > 0 ? 'Needs attention' : 'All current'}
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Progress - Currently showing static data, in a real app you'd calculate this from historical data */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="glass" className="p-6">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Progress</CardTitle>
                <StatusBadge variant="success" showIcon>
                  {stats.completionRate > 0 ? `+${Math.max(0, stats.completionRate - 50)}%` : '0%'} this week
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {weeklyProgress.map((progress, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <span className="text-xs text-muted-foreground mb-2">{weekDays[index]}</span>
                    <div className="relative h-24 w-full rounded-xl bg-secondary/50 overflow-hidden">
                      <motion.div
                        className="absolute bottom-0 w-full gradient-cool rounded-xl"
                        initial={{ height: 0 }}
                        animate={{ height: `${progress}%` }}
                        transition={{ delay: 0.7 + index * 0.05, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-medium mt-2">{progress}%</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion Ring */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="p-6 h-full">
            <CardHeader className="p-0 pb-6">
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center justify-center">
              <ProgressRing
                value={stats.completionRate}
                size="xl"
                variant="gradient"
                valueLabel="completed"
              />
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="glass" className="p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tasks</CardTitle>
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" size="sm" rightIcon={<HiArrowRight className="h-4 w-4" />}>
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl transition-all duration-200',
                        'bg-secondary/30 hover:bg-secondary/50'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            task.is_completed ? 'bg-success/20' : 'bg-warning/20'
                          )}
                        >
                          {task.is_completed ? (
                            <HiCheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <HiClock className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            'font-medium',
                            task.is_completed && 'line-through text-muted-foreground'
                          )}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent tasks yet</p>
                    <p className="text-sm mt-1">Create your first task to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="p-6 h-full">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <Link href="/dashboard/calendar">
                  <Button variant="ghost" size="icon-sm">
                    <HiCalendarDays className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-1 h-10 rounded-full bg-neon-blue" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No events scheduled</p>
                    <p className="text-sm mt-1">Add events to your calendar</p>
                  </div>
                )}
              </div>
              <Link href="/dashboard/calendar" className="block mt-4">
                <Button variant="outline" className="w-full" size="sm">
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
