'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HiCheckCircle } from 'react-icons/hi2'
import MainLayout from '@/components/layout/main-layout'
import { apiClient } from '@/lib/api-client'

interface User {
  email?: string
  name?: string
  avatar?: string
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    const checkAuth = async () => {
      if (!apiClient.isAuthenticated()) {
        router.push('/login')
        return
      }

      try {
        const result = await apiClient.getProfile()
        if (result.data) {
          setUser({
            email: result.data.email,
            name: result.data.display_name || undefined,
          })
          if (!result.data.onboarding_completed) {
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {
        // Continue to dashboard even if profile fetch fails
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
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

        {/* Loading text */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-medium gradient-text">Taskflow</p>
          <p className="text-sm text-muted-foreground mt-1">
            Loading your workspace...
          </p>
        </motion.div>
      </div>
    )
  }

  return <MainLayout user={user}>{children}</MainLayout>
}

export default DashboardLayout
