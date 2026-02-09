'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSun, HiMoon, HiComputerDesktop } from 'react-icons/hi2'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme/theme-provider'

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'dropdown'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'default',
  className,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'rounded-lg bg-muted animate-pulse',
          size === 'sm' && 'h-8 w-8',
          size === 'default' && 'h-10 w-10',
          size === 'lg' && 'h-12 w-12'
        )}
      />
    )
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'relative flex items-center justify-center rounded-lg transition-colors',
          'bg-secondary hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          size === 'sm' && 'h-8 w-8',
          size === 'default' && 'h-10 w-10',
          size === 'lg' && 'h-12 w-12',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedTheme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiMoon className={cn(iconSize, 'text-foreground')} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiSun className={cn(iconSize, 'text-foreground')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  if (variant === 'switch') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-1 rounded-full bg-secondary',
          className
        )}
      >
        {[
          { value: 'light', icon: HiSun, label: 'Light' },
          { value: 'system', icon: HiComputerDesktop, label: 'System' },
          { value: 'dark', icon: HiMoon, label: 'Dark' },
        ].map(({ value, icon: Icon, label }) => (
          <motion.button
            key={value}
            onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-colors',
              size === 'sm' && 'h-7 w-7',
              size === 'default' && 'h-9 w-9',
              size === 'lg' && 'h-11 w-11',
              theme === value && 'text-primary-foreground',
              theme !== value && 'text-muted-foreground hover:text-foreground'
            )}
            whileTap={{ scale: 0.95 }}
            aria-label={label}
          >
            {theme === value && (
              <motion.div
                layoutId="theme-toggle-bg"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className={cn('relative z-10', iconSize)} />
          </motion.button>
        ))}
      </div>
    )
  }

  // Dropdown variant
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors',
          'bg-secondary hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          size === 'sm' && 'h-8 w-8',
          size === 'default' && 'h-10 w-10',
          size === 'lg' && 'h-12 w-12'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {resolvedTheme === 'dark' ? (
          <HiMoon className={iconSize} />
        ) : (
          <HiSun className={iconSize} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-36 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50"
          >
            {[
              { value: 'light', icon: HiSun, label: 'Light' },
              { value: 'dark', icon: HiMoon, label: 'Dark' },
              { value: 'system', icon: HiComputerDesktop, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value as 'light' | 'dark' | 'system')
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent',
                  theme === value && 'bg-accent text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { ThemeToggle }
