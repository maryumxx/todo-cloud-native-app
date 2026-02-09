'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiSparkles, HiRocketLaunch, HiShieldCheck } from 'react-icons/hi2'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const features = [
    { icon: HiSparkles, text: 'Intuitive task management' },
    { icon: HiRocketLaunch, text: 'Boost your productivity' },
    { icon: HiShieldCheck, text: 'Secure & private' },
  ]

  return (
    <div className="min-h-screen flex gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1 top-20 left-10" />
        <div className="blob blob-2 bottom-20 right-20" />
        <div className="blob blob-3 top-1/2 left-1/2" />
      </div>

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative z-10">
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-neon-blue"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiCheckCircle className="h-7 w-7 text-white" />
            </motion.div>
            <span className="font-bold text-2xl gradient-text">Taskflow</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                <span className="gradient-text">Organize</span>
                <br />
                your life,
                <br />
                <span className="text-muted-foreground">one task at a time.</span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg text-muted-foreground max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Join thousands of users who trust Taskflow to manage their daily
              tasks, projects, and goals efficiently.
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              className="space-y-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 glass-subtle rounded-2xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-neon-blue">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Taskflow. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 glass">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-neon-blue">
              <HiCheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Taskflow</span>
          </Link>
          <ThemeToggle variant="icon" size="sm" />
        </div>

        {/* Theme Toggle (Desktop) */}
        <div className="hidden lg:flex justify-end p-6">
          <ThemeToggle variant="switch" />
        </div>

        {/* Auth Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden text-center text-muted-foreground text-sm p-4">
          &copy; {new Date().getFullYear()} Taskflow. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
