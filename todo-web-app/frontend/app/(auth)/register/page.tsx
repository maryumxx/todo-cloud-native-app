'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HiEnvelope, HiLockClosed, HiUserPlus, HiArrowRight } from 'react-icons/hi2'
import { apiClient } from '@/lib/api-client'
import { MotionButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/label'
import {
  GradientCard,
  GradientCardHeader,
  GradientCardTitle,
  GradientCardDescription,
  GradientCardContent,
} from '@/components/ui/gradient-card'

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const validateForm = useCallback((): string | null => {
    if (!email.trim()) {
      return 'Email is required'
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }

    return null
  }, [email, password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const response = await apiClient.register(email, password)

    if (response.error) {
      setError(response.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/tasks')
  }

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-destructive' }
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-warning' }
    return { strength, label: 'Strong', color: 'bg-success' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <GradientCard variant="glass" padding="lg" className="backdrop-blur-xl">
      <GradientCardHeader className="text-center space-y-2">
        <motion.div
          className="mx-auto w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center shadow-glow mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <HiUserPlus className="h-8 w-8 text-white" />
        </motion.div>
        <GradientCardTitle className="text-2xl">Create an account</GradientCardTitle>
        <GradientCardDescription>
          Start organizing your tasks today
        </GradientCardDescription>
      </GradientCardHeader>

      <GradientCardContent>
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <p className="text-sm text-destructive font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Email address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<HiEnvelope className="h-5 w-5" />}
              autoComplete="email"
              required
              inputSize="lg"
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              leftIcon={<HiLockClosed className="h-5 w-5" />}
              autoComplete="new-password"
              required
              inputSize="lg"
              hint="At least 8 characters"
            />
            {/* Password strength indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${passwordStrength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength.label}
                  </span>
                </div>
              </motion.div>
            )}
          </FormField>

          <FormField label="Confirm password" required>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              leftIcon={<HiLockClosed className="h-5 w-5" />}
              autoComplete="new-password"
              required
              inputSize="lg"
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              success={
                confirmPassword && password === confirmPassword
                  ? 'Passwords match'
                  : undefined
              }
            />
          </FormField>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          <MotionButton
            type="submit"
            variant="gradient"
            size="xl"
            className="w-full"
            isLoading={loading}
            rightIcon={!loading && <HiArrowRight className="h-5 w-5" />}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </MotionButton>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </GradientCardContent>
    </GradientCard>
  )
}

export default RegisterPage
