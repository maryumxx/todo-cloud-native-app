'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiClock,
  HiSparkles,
} from 'react-icons/hi2'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        destructive: 'bg-destructive/10 text-destructive',
        info: 'bg-info/10 text-info',
        outline: 'border border-current bg-transparent',
        gradient: 'gradient-primary text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const iconMap = {
  success: HiCheckCircle,
  warning: HiExclamationCircle,
  destructive: HiXCircle,
  info: HiInformationCircle,
  pending: HiClock,
  new: HiSparkles,
}

export interface StatusBadgeProps
  extends VariantProps<typeof badgeVariants> {
  icon?: keyof typeof iconMap | React.ReactNode
  showIcon?: boolean
  animated?: boolean
  pulse?: boolean
  className?: string
  children?: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      showIcon = false,
      animated = false,
      pulse = false,
      children,
    },
    ref
  ) => {
    // Determine icon to show
    let IconComponent: React.ComponentType<{ className?: string }> | null = null
    if (showIcon || icon) {
      if (typeof icon === 'string' && icon in iconMap) {
        IconComponent = iconMap[icon as keyof typeof iconMap]
      } else if (React.isValidElement(icon)) {
        IconComponent = () => icon as React.ReactElement
      } else if (variant && variant in iconMap) {
        IconComponent = iconMap[variant as keyof typeof iconMap]
      }
    }

    const badgeContent = (
      <>
        {IconComponent && (
          <IconComponent
            className={cn(
              size === 'sm' && 'h-3 w-3',
              size === 'default' && 'h-3.5 w-3.5',
              size === 'lg' && 'h-4 w-4'
            )}
          />
        )}
        {children}
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                variant === 'success' && 'bg-success',
                variant === 'warning' && 'bg-warning',
                variant === 'destructive' && 'bg-destructive',
                variant === 'info' && 'bg-info',
                (!variant || variant === 'default' || variant === 'secondary') && 'bg-primary'
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                variant === 'success' && 'bg-success',
                variant === 'warning' && 'bg-warning',
                variant === 'destructive' && 'bg-destructive',
                variant === 'info' && 'bg-info',
                (!variant || variant === 'default' || variant === 'secondary') && 'bg-primary'
              )}
            />
          </span>
        )}
      </>
    )

    if (animated) {
      return (
        <motion.span
          ref={ref}
          className={cn(badgeVariants({ variant, size, className }))}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {badgeContent}
        </motion.span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
      >
        {badgeContent}
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

// Preset status badges for common use cases
const TaskStatusBadge: React.FC<{
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  size?: VariantProps<typeof badgeVariants>['size']
}> = ({ status, size }) => {
  const config = {
    pending: { variant: 'secondary' as const, label: 'Pending', icon: 'pending' as const, pulse: false },
    in_progress: { variant: 'info' as const, label: 'In Progress', icon: 'info' as const, pulse: true },
    completed: { variant: 'success' as const, label: 'Completed', icon: 'success' as const, pulse: false },
    overdue: { variant: 'destructive' as const, label: 'Overdue', icon: 'destructive' as const, pulse: false },
  }

  const { variant, label, icon, pulse } = config[status] || config.pending

  return (
    <StatusBadge variant={variant} size={size} icon={icon} showIcon pulse={pulse}>
      {label}
    </StatusBadge>
  )
}

const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'urgent'
  size?: VariantProps<typeof badgeVariants>['size']
}> = ({ priority, size }) => {
  const config = {
    low: { variant: 'secondary' as const, label: 'Low', pulse: false },
    medium: { variant: 'info' as const, label: 'Medium', pulse: false },
    high: { variant: 'warning' as const, label: 'High', pulse: false },
    urgent: { variant: 'destructive' as const, label: 'Urgent', pulse: true },
  }

  const { variant, label, pulse } = config[priority] || config.medium

  return (
    <StatusBadge variant={variant} size={size} pulse={pulse}>
      {label}
    </StatusBadge>
  )
}

export { StatusBadge, TaskStatusBadge, PriorityBadge, badgeVariants }
