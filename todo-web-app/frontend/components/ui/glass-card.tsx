'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: 'light' | 'medium' | 'heavy'
  border?: boolean
  glow?: boolean
  hover?: 'none' | 'lift' | 'scale' | 'glow'
  animated?: boolean
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
}

const opacityClasses = {
  light: 'bg-white/40 dark:bg-slate-900/40',
  medium: 'bg-white/60 dark:bg-slate-900/60',
  heavy: 'bg-white/80 dark:bg-slate-900/80',
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      blur = 'lg',
      opacity = 'medium',
      border = true,
      glow = false,
      hover = 'none',
      animated = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'rounded-2xl transition-all duration-300',
      blurClasses[blur],
      opacityClasses[opacity],
      border && 'border border-white/20 dark:border-white/10',
      glow && 'shadow-glass',
      hover === 'lift' && 'hover:-translate-y-1 hover:shadow-glass-lg',
      hover === 'scale' && 'hover:scale-[1.02]',
      hover === 'glow' && 'hover:shadow-neon-purple',
      className
    )

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={
            hover === 'lift'
              ? { y: -4, transition: { duration: 0.2 } }
              : hover === 'scale'
              ? { scale: 1.02, transition: { duration: 0.2 } }
              : undefined
          }
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

// Specific variants
const GlassCardPrimary = React.forwardRef<HTMLDivElement, Omit<GlassCardProps, 'glow'>>(
  ({ className, ...props }, ref) => (
    <GlassCard
      ref={ref}
      className={cn('border-primary/20', className)}
      glow
      {...props}
    />
  )
)
GlassCardPrimary.displayName = 'GlassCardPrimary'

const GlassCardAccent = React.forwardRef<HTMLDivElement, Omit<GlassCardProps, 'glow'>>(
  ({ className, ...props }, ref) => (
    <GlassCard
      ref={ref}
      className={cn('border-accent/20 bg-accent/5', className)}
      glow
      {...props}
    />
  )
)
GlassCardAccent.displayName = 'GlassCardAccent'

// Glass Panel for larger surfaces
const GlassPanel = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, blur = 'xl', opacity = 'heavy', ...props }, ref) => (
    <GlassCard
      ref={ref}
      blur={blur}
      opacity={opacity}
      className={cn('shadow-glass-lg', className)}
      {...props}
    />
  )
)
GlassPanel.displayName = 'GlassPanel'

export { GlassCard, GlassCardPrimary, GlassCardAccent, GlassPanel }
