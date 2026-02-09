'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HiCheckCircle,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiShieldCheck,
  HiSparkles,
  HiArrowRight,
} from 'react-icons/hi2'
import { MotionButton } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import useSession from '@/hooks/use-session'




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

const features = [
  {
    icon: HiClipboardDocumentList,
    title: 'Task Management',
    description: 'Organize and prioritize your tasks with our intuitive interface.',
    color: 'bg-neon-blue/10',
    iconColor: 'text-neon-blue',
  },
  {
    icon: HiCalendarDays,
    title: 'Calendar View',
    description: 'Visualize your schedule and deadlines with our calendar feature.',
    color: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    icon: HiShieldCheck,
    title: 'Secure & Private',
    description: 'Your data is protected with industry standard security measures.',
    color: 'bg-neon-purple/10',
    iconColor: 'text-neon-purple',
  },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useSession()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard/tasks')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob blob-1 top-20 left-10" />
          <div className="blob blob-2 bottom-20 right-20" />
          <div className="blob blob-3 top-1/2 left-1/2" />
        </div>

        {/* Animated logo */}
        <motion.div
          className="relative z-10 w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center shadow-neon-blue"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <HiCheckCircle className="h-10 w-10 text-white" />
        </motion.div>

        {/* Loading dots */}
        <div className="relative z-10 flex items-center gap-2">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full gradient-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1 top-20 left-10" />
        <div className="blob blob-2 bottom-20 right-20" />
        <div className="blob blob-3 top-1/2 left-1/2" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-neon-blue"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiCheckCircle className="h-6 w-6 text-white" />
            </motion.div>
            <span className="font-bold text-xl gradient-text">Taskflow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <MotionButton variant="ghost" size="sm">
                Sign In
              </MotionButton>
            </Link>
            <Link href="/register">
              <MotionButton variant="gradient" size="sm">
                Get Started
              </MotionButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HiSparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Now with Calendar & Analytics</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="gradient-text">Boost Your</span>
            <br />
            <span className="text-foreground">Productivity</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            variants={itemVariants}
          >
            A clean, intuitive task management application designed to help you
            organize your work and achieve your goals efficiently.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link href="/register">
              <MotionButton
                variant="gradient"
                size="xl"
                rightIcon={<HiArrowRight className="h-5 w-5" />}
              >
                Get Started Free
              </MotionButton>
            </Link>
            <Link href="/login">
              <MotionButton variant="outline" size="xl">
                Sign In
              </MotionButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          variants={itemVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <GlassCard
                hover="lift"
                className="p-6 h-full"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="inline-flex gap-12 px-12 py-8">
            <div>
              <p className="text-4xl font-bold gradient-text">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Users</p>
            </div>
            <div className="border-l border-border" />
            <div>
              <p className="text-4xl font-bold gradient-text">500K+</p>
              <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
            </div>
            <div className="border-l border-border" />
            <div>
              <p className="text-4xl font-bold gradient-text">99.9%</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <HiCheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold gradient-text">Taskflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Taskflow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
