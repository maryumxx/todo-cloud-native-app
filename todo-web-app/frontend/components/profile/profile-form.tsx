'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiUser, HiEnvelope, HiLink, HiCheck } from 'react-icons/hi2'
import { UserProfile, UserProfileUpdate } from '@/lib/types'
import { useTheme, Theme } from '@/lib/theme/theme-provider'
import { Input, Textarea } from '@/components/ui/input'
import { FormField } from '@/components/ui/label'
import { Button, MotionButton } from '@/components/ui/button'

interface ProfileFormProps {
  profile: UserProfile
  onSubmit: (data: UserProfileUpdate) => Promise<void>
  onCancel?: () => void
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const { setTheme } = useTheme()
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [themePreference, setThemePreference] = useState<Theme>(
    (profile.theme_preference as Theme) || 'system'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        display_name: displayName || undefined,
        bio: bio || undefined,
        avatar_url: avatarUrl || undefined,
        theme_preference: themePreference,
      })
      setTheme(themePreference)
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError('Failed to update profile. Please try again.')
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

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2"
          >
            <HiCheck className="h-5 w-5 text-success" />
            <p className="text-sm text-success font-medium">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <FormField label="Email" hint="Email cannot be changed">
        <Input
          type="email"
          value={profile.email}
          disabled
          leftIcon={<HiEnvelope className="h-5 w-5" />}
          inputSize="lg"
        />
      </FormField>

      <FormField label="Display Name">
        <Input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          leftIcon={<HiUser className="h-5 w-5" />}
          inputSize="lg"
          maxLength={100}
        />
      </FormField>

      <FormField label="Bio" hint={`${bio.length}/500 characters`}>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          rows={3}
          maxLength={500}
        />
      </FormField>

      <FormField label="Avatar URL">
        <Input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          leftIcon={<HiLink className="h-5 w-5" />}
          inputSize="lg"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <MotionButton
          type="submit"
          variant="gradient"
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <HiCheck className="h-5 w-5" /> : undefined}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </MotionButton>
      </div>
    </form>
  )
}

export default ProfileForm
