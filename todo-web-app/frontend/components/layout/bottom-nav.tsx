'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiUser,
} from 'react-icons/hi2'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/tasks',
    label: 'Tasks',
    icon: HiOutlineClipboardDocumentList,
    activeIcon: HiClipboardDocumentList,
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendar',
    icon: HiOutlineCalendarDays,
    activeIcon: HiCalendarDays,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: HiOutlineUser,
    activeIcon: HiUser,
  },
]

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 md:hidden z-50',
        'bg-background/80 backdrop-blur-xl border-t border-border',
        'safe-area-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = isActive ? item.activeIcon : item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-0.5 w-12 h-1 rounded-full gradient-primary"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.9,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </motion.div>

              <motion.span
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95,
                }}
                className={cn(
                  'text-xs mt-1 font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
