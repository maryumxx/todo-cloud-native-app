'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'default' | 'lg' | 'xl'
  strokeWidth?: number
  showValue?: boolean
  valueLabel?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'destructive'
  animated?: boolean
}

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4, fontSize: 'text-xs' },
  default: { size: 64, strokeWidth: 5, fontSize: 'text-sm' },
  lg: { size: 96, strokeWidth: 6, fontSize: 'text-base' },
  xl: { size: 128, strokeWidth: 8, fontSize: 'text-lg' },
}

const variantColors = {
  default: 'stroke-primary',
  gradient: 'stroke-[url(#gradient)]',
  success: 'stroke-success',
  warning: 'stroke-warning',
  destructive: 'stroke-destructive',
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      max = 100,
      size = 'default',
      strokeWidth: customStrokeWidth,
      showValue = true,
      valueLabel,
      variant = 'default',
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const config = sizeConfig[size]
    const strokeWidth = customStrokeWidth ?? config.strokeWidth
    const svgSize = config.size
    const radius = (svgSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const offset = circumference - (percentage / 100) * circumference

    const gradientId = React.useId()

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        {...props}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
              <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />

          {/* Progress Circle */}
          {animated ? (
            <motion.circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={variant === 'gradient' ? '' : variantColors[variant]}
              stroke={variant === 'gradient' ? `url(#${gradientId})` : undefined}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          ) : (
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={variant === 'gradient' ? '' : variantColors[variant]}
              stroke={variant === 'gradient' ? `url(#${gradientId})` : undefined}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          )}
        </svg>

        {/* Center Value */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {animated ? (
              <motion.span
                className={cn('font-semibold', config.fontSize)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {Math.round(percentage)}%
              </motion.span>
            ) : (
              <span className={cn('font-semibold', config.fontSize)}>
                {Math.round(percentage)}%
              </span>
            )}
            {valueLabel && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {valueLabel}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
ProgressRing.displayName = 'ProgressRing'

// Linear Progress Bar variant
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  showValue?: boolean
  animated?: boolean
}

const progressBarSizes = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-3',
}

const progressBarColors = {
  default: 'bg-primary',
  gradient: 'gradient-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'default',
      showValue = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showValue && (
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-muted',
            progressBarSizes[size]
          )}
        >
          {animated ? (
            <motion.div
              className={cn('h-full rounded-full', progressBarColors[variant])}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ) : (
            <div
              className={cn('h-full rounded-full', progressBarColors[variant])}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

export { ProgressRing, ProgressBar }
