'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, getInitials } from '@/lib/utils'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      ring: {
        none: '',
        default: 'ring-2 ring-background',
        primary: 'ring-2 ring-primary',
        gradient: 'ring-2 ring-offset-2 ring-offset-background',
      },
    },
    defaultVariants: {
      size: 'default',
      ring: 'none',
    },
  }
)

const fallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary text-primary-foreground',
        gradient: 'gradient-primary text-white',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AnimatedAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants>,
    VariantProps<typeof fallbackVariants> {
  src?: string
  alt?: string
  fallback?: string
  animated?: boolean
  online?: boolean
}

const AnimatedAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AnimatedAvatarProps
>(
  (
    {
      className,
      size,
      ring,
      variant,
      src,
      alt,
      fallback,
      animated = true,
      online,
      ...props
    },
    ref
  ) => {
    const initials = fallback ? getInitials(fallback) : '?'

    const avatarContent = (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, ring, className }))}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(fallbackVariants({ variant }))}
          delayMs={600}
        >
          {initials}
        </AvatarPrimitive.Fallback>

        {/* Gradient ring effect for gradient ring variant */}
        {ring === 'gradient' && (
          <div className="absolute inset-0 -z-10 rounded-full gradient-primary blur-sm scale-110" />
        )}

        {/* Online status indicator */}
        {online !== undefined && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
              size === 'xs' && 'h-1.5 w-1.5',
              size === 'sm' && 'h-2 w-2',
              size === 'default' && 'h-2.5 w-2.5',
              size === 'lg' && 'h-3 w-3',
              size === 'xl' && 'h-3.5 w-3.5',
              size === '2xl' && 'h-4 w-4',
              online ? 'bg-success' : 'bg-muted-foreground'
            )}
          />
        )}
      </AvatarPrimitive.Root>
    )

    if (animated) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex"
        >
          {avatarContent}
        </motion.div>
      )
    }

    return avatarContent
  }
)
AnimatedAvatar.displayName = 'AnimatedAvatar'

// Avatar Group for showing multiple avatars
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  size?: VariantProps<typeof avatarVariants>['size']
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 4, size = 'default', className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleChildren = childrenArray.slice(0, max)
    const remainingCount = childrenArray.length - max

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="relative" style={{ zIndex: visibleChildren.length - index }}>
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AnimatedAvatarProps>, {
                  size,
                  ring: 'default',
                })
              : child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size, ring: 'default' }),
              'flex items-center justify-center bg-muted text-muted-foreground font-medium'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

export { AnimatedAvatar, AvatarGroup, avatarVariants, fallbackVariants }
