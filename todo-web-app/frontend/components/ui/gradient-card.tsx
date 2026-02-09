'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gradientCardVariants = cva(
  'relative overflow-hidden rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-lg',
        glass: 'glass-card',
        gradient: 'gradient-primary text-white',
        outline: 'border-2 border-primary/20 bg-card hover:border-primary/40',
        elevated: 'bg-card shadow-xl hover:shadow-2xl',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-xl',
        glow: 'hover:shadow-glow',
        scale: 'hover:scale-[1.02]',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: 'lift',
      padding: 'default',
    },
  }
)

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientCardVariants> {
  gradientFrom?: string
  gradientTo?: string
  animated?: boolean
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    {
      className,
      variant,
      hover,
      padding,
      gradientFrom,
      gradientTo,
      animated = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const customGradientStyle =
      gradientFrom && gradientTo
        ? {
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
            ...style,
          }
        : style

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(gradientCardVariants({ variant, hover: 'none', padding, className }))}
          style={customGradientStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
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
      <div
        ref={ref}
        className={cn(gradientCardVariants({ variant, hover, padding, className }))}
        style={customGradientStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GradientCard.displayName = 'GradientCard'

// Card sub-components for composition
const GradientCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
GradientCardHeader.displayName = 'GradientCardHeader'

const GradientCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-lg', className)}
    {...props}
  />
))
GradientCardTitle.displayName = 'GradientCardTitle'

const GradientCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
GradientCardDescription.displayName = 'GradientCardDescription'

const GradientCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-4', className)} {...props} />
))
GradientCardContent.displayName = 'GradientCardContent'

const GradientCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
GradientCardFooter.displayName = 'GradientCardFooter'

export {
  GradientCard,
  GradientCardHeader,
  GradientCardTitle,
  GradientCardDescription,
  GradientCardContent,
  GradientCardFooter,
  gradientCardVariants,
}
