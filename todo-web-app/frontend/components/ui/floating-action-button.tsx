'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { HiPlus, HiX } from 'react-icons/hi'

const fabVariants = cva(
  'fixed flex items-center justify-center rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors z-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        gradient: 'gradient-primary text-white hover:shadow-glow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-14 w-14',
        sm: 'h-12 w-12',
        lg: 'h-16 w-16',
      },
      position: {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
      },
    },
    defaultVariants: {
      variant: 'gradient',
      size: 'default',
      position: 'bottom-right',
    },
  }
)

export interface FloatingActionButtonProps
  extends VariantProps<typeof fabVariants> {
  icon?: React.ReactNode
  label?: string
  showLabel?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
  actions?: Array<{
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
  }>
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      className,
      variant,
      size,
      position,
      icon,
      label,
      showLabel = false,
      actions,
      onClick,
      disabled,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const hasActions = actions && actions.length > 0

    const handleClick = () => {
      if (disabled) return
      if (hasActions) {
        setIsOpen(!isOpen)
      } else if (onClick) {
        onClick()
      }
    }

    const iconSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'

    return (
      <>
        {/* Backdrop when actions are open */}
        <AnimatePresence>
          {isOpen && hasActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Action items */}
        <AnimatePresence>
          {isOpen && hasActions && (
            <div
              className={cn(
                'fixed z-50 flex flex-col-reverse gap-3',
                position === 'bottom-right' && 'bottom-24 right-6',
                position === 'bottom-left' && 'bottom-24 left-6',
                position === 'bottom-center' && 'bottom-24 left-1/2 -translate-x-1/2'
              )}
            >
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg',
                    action.variant === 'destructive'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-card text-card-foreground'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="h-5 w-5">{action.icon}</span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          ref={ref}
          className={cn(fabVariants({ variant, size, position, className }))}
          onClick={handleClick}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {hasActions ? (
            isOpen ? (
              <HiX className={iconSize} />
            ) : (
              icon || <HiPlus className={iconSize} />
            )
          ) : (
            icon || <HiPlus className={iconSize} />
          )}
        </motion.button>

        {/* Extended label */}
        {showLabel && label && !isOpen && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'fixed z-50 px-3 py-1.5 rounded-full bg-card text-card-foreground text-sm font-medium shadow-lg',
              position === 'bottom-right' && 'bottom-8 right-24',
              position === 'bottom-left' && 'bottom-8 left-24',
              position === 'bottom-center' && 'bottom-8 left-1/2 translate-x-8'
            )}
          >
            {label}
          </motion.span>
        )}
      </>
    )
  }
)
FloatingActionButton.displayName = 'FloatingActionButton'

// Simple FAB without expandable actions
const SimpleFAB = React.forwardRef<
  HTMLButtonElement,
  Omit<FloatingActionButtonProps, 'actions'>
>(({ className, variant, size, position, icon, onClick, disabled }, ref) => {
  const iconSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'

  return (
    <motion.button
      ref={ref}
      className={cn(fabVariants({ variant, size, position, className }))}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {icon || <HiPlus className={iconSize} />}
    </motion.button>
  )
})
SimpleFAB.displayName = 'SimpleFAB'

export { FloatingActionButton, SimpleFAB, fabVariants }
