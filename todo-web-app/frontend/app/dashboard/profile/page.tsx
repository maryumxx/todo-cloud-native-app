'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HiCalendarDays,
  HiCheckBadge,
  HiArrowRightOnRectangle,
  HiCog6Tooth,
  HiShieldCheck,
} from 'react-icons/hi2'
import { ProfileForm } from '@/components/profile/profile-form'
import { apiClient } from '@/lib/api-client'
import { UserProfile, UserProfileUpdate } from '@/lib/types'
import { AnimatedAvatar } from '@/components/ui/animated-avatar'
import { Button, MotionButton } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  GradientCard,
  GradientCardHeader,
  GradientCardTitle,
  GradientCardDescription,
  GradientCardContent,
} from '@/components/ui/gradient-card'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const result = await apiClient.getProfile()
      if (result.data) {
        setProfile(result.data)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (data: UserProfileUpdate) => {
    const result = await apiClient.updateProfile(data)
    if (result.data) {
      setProfile(result.data)
    } else if (result.error) {
      throw new Error(result.error)
    }
  }

  const handleLogout = () => {
    apiClient.logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <GradientCard variant="default" padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <HiShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Failed to Load Profile</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProfile}>Try Again</Button>
          </div>
        </GradientCard>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </motion.div>

      {/* Profile Card */}
      <GradientCard variant="gradient" padding="lg" animated hover="none">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-white">
          <AnimatedAvatar
            size="2xl"
            fallback={profile.display_name || profile.email}
            src={profile.avatar_url || undefined}
            variant="primary"
            ring="default"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">
              {profile.display_name || 'User'}
            </h2>
            <p className="text-white/70">{profile.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {profile.onboarding_completed && (
                <StatusBadge variant="success" icon="success" showIcon size="sm">
                  Verified
                </StatusBadge>
              )}
              <StatusBadge variant="secondary" size="sm">
                Member
              </StatusBadge>
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Edit Profile */}
      <GradientCard variant="default" padding="lg" animated>
        <GradientCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HiCog6Tooth className="h-5 w-5 text-primary" />
            </div>
            <div>
              <GradientCardTitle>Edit Profile</GradientCardTitle>
              <GradientCardDescription>
                Update your personal information
              </GradientCardDescription>
            </div>
          </div>
        </GradientCardHeader>
        <GradientCardContent>
          <ProfileForm profile={profile} onSubmit={handleUpdateProfile} />
        </GradientCardContent>
      </GradientCard>

      {/* Account Information */}
      <GradientCard variant="default" padding="lg" animated>
        <GradientCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <HiShieldCheck className="h-5 w-5 text-info" />
            </div>
            <div>
              <GradientCardTitle>Account Information</GradientCardTitle>
              <GradientCardDescription>
                Your account details and status
              </GradientCardDescription>
            </div>
          </div>
        </GradientCardHeader>
        <GradientCardContent>
          <dl className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <HiCalendarDays className="h-5 w-5 text-muted-foreground" />
                <dt className="text-sm font-medium">Member since</dt>
              </div>
              <dd className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <HiCheckBadge className="h-5 w-5 text-muted-foreground" />
                <dt className="text-sm font-medium">Onboarding</dt>
              </div>
              <dd>
                {profile.onboarding_completed ? (
                  <StatusBadge variant="success" size="sm">
                    Completed
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="warning" size="sm">
                    Pending
                  </StatusBadge>
                )}
              </dd>
            </div>
          </dl>
        </GradientCardContent>
      </GradientCard>

      {/* Preferences */}
      <GradientCard variant="default" padding="lg" animated>
        <GradientCardHeader>
          <GradientCardTitle>Preferences</GradientCardTitle>
          <GradientCardDescription>
            Customize your experience
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeToggle variant="switch" size="sm" />
          </div>
        </GradientCardContent>
      </GradientCard>

      {/* Danger Zone */}
      <GradientCard variant="default" padding="lg" animated>
        <GradientCardHeader>
          <GradientCardTitle className="text-destructive">
            Danger Zone
          </GradientCardTitle>
          <GradientCardDescription>
            Irreversible account actions
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <MotionButton
              variant="destructive"
              onClick={handleLogout}
              leftIcon={<HiArrowRightOnRectangle className="h-5 w-5" />}
            >
              Sign out
            </MotionButton>
          </div>
        </GradientCardContent>
      </GradientCard>
    </div>
  )
}
