'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HiExclamationCircle, HiCheckCircle, HiEye, HiEyeSlash } from 'react-icons/hi2'

const inputVariants = cva(
  'flex w-full rounded-lg border bg-background text-foreground transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        filled: 'border-transparent bg-secondary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring',
        ghost: 'border-transparent hover:bg-accent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring',
        error: 'border-destructive focus-visible:ring-2 focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-2 focus-visible:ring-success',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      leftIcon,
      rightIcon,
      error,
      success,
      hint,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const currentVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="w-full space-y-1.5">
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, inputSize, className }),
              leftIcon && 'pl-10',
              (rightIcon || isPassword || error || success) && 'pr-10'
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {/* Right Section (Icon, Password Toggle, Status) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Status icons */}
            {error && !isPassword && (
              <HiExclamationCircle className="h-5 w-5 text-destructive" />
            )}
            {success && !isPassword && !error && (
              <HiCheckCircle className="h-5 w-5 text-success" />
            )}

            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <HiEyeSlash className="h-5 w-5" />
                ) : (
                  <HiEye className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Custom right icon */}
            {rightIcon && !isPassword && !error && !success && (
              <span className="text-muted-foreground">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Helper text */}
        {(error || success || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-xs',
              error && 'text-destructive',
              success && !error && 'text-success',
              !error && !success && 'text-muted-foreground'
            )}
          >
            {error || success || hint}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: string
  success?: string
  hint?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      inputSize,
      error,
      success,
      hint,
      ...props
    },
    ref
  ) => {
    const currentVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="w-full space-y-1.5">
        <textarea
          className={cn(
            inputVariants({ variant: currentVariant, className }),
            'min-h-[80px] py-3 resize-y'
          )}
          ref={ref}
          {...props}
        />

        {(error || success || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-xs',
              error && 'text-destructive',
              success && !error && 'text-success',
              !error && !success && 'text-muted-foreground'
            )}
          >
            {error || success || hint}
          </motion.p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea, inputVariants }
