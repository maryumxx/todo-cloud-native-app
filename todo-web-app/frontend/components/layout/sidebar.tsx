'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiCheckCircle,
} from 'react-icons/hi2'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AnimatedAvatar } from '@/components/ui/animated-avatar'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/tasks',
    label: 'Tasks',
    icon: HiOutlineClipboardDocumentList,
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendar',
    icon: HiOutlineCalendarDays,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: HiOutlineUser,
  },
]

interface SidebarProps {
  className?: string
  user?: {
    email?: string
    name?: string
    avatar?: string
  }
}

export function Sidebar({ className = '', user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard/tasks" className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiCheckCircle className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <span className="font-bold text-lg text-white">TodoApp</span>
            <p className="text-xs text-sidebar-foreground/60">Get things done</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 gradient-primary rounded-xl shadow-glow"
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="relative z-10 h-5 w-5" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="relative z-10 ml-auto px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings link */}
      <div className="px-4 mb-4">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <HiOutlineCog6Tooth className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AnimatedAvatar
            size="default"
            fallback={user?.email || user?.name || 'U'}
            src={user?.avatar}
            variant="gradient"
            animated={false}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <ThemeToggle variant="icon" size="sm" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
