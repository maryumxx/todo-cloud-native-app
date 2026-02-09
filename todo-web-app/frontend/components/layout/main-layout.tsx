'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiBars3,
  HiXMark,
  HiHome,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiUser,
} from 'react-icons/hi2'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AnimatedAvatar } from '@/components/ui/animated-avatar'
import { FloatingActionButton } from '@/components/ui/floating-action-button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: HiOutlineHome,
    activeIcon: HiHome,
  },
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

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    email?: string
    name?: string
    avatar?: string
  }
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Get current page title
  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )
  const pageTitle = currentPage?.label || 'Dashboard'

  return (
    <div className="min-h-screen gradient-bg">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1 top-0 left-0" />
        <div className="blob blob-2 top-1/2 right-0" />
        <div className="blob blob-3 bottom-0 left-1/3" />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 glass-card rounded-none rounded-r-3xl md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between p-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-neon-blue">
                    <HiCheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-lg gradient-text">Taskflow</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-2">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                    const Icon = isActive ? item.activeIcon : item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="mobile-nav-active"
                              className="absolute inset-0 rounded-xl gradient-primary"
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}
                          <Icon className="relative z-10 h-5 w-5" />
                          <span className="relative z-10 font-medium">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* User Section */}
              <div className="p-4 m-4 rounded-2xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <AnimatedAvatar
                    size="default"
                    fallback={user?.email || user?.name || 'U'}
                    src={user?.avatar}
                    variant="gradient"
                    animated={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <ThemeToggle variant="icon" size="sm" />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 z-30 hidden md:flex flex-col glass-card rounded-none rounded-r-3xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-neon-blue flex-shrink-0"
            >
              <HiCheckCircle className="h-6 w-6 text-white" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <span className="font-bold text-lg gradient-text whitespace-nowrap">
                    Taskflow
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              const Icon = isActive ? item.activeIcon : item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      sidebarCollapsed && 'justify-center',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-nav-active"
                        className="absolute inset-0 rounded-xl gradient-primary shadow-neon-blue"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className="relative z-10 h-5 w-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-3">
          {/* Settings */}
          <Link
            href="/dashboard/profile"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200',
              sidebarCollapsed && 'justify-center'
            )}
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <HiOutlineCog6Tooth className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Profile */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 rounded-2xl bg-secondary/50 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <AnimatedAvatar
                    size="default"
                    fallback={user?.email || user?.name || 'U'}
                    src={user?.avatar}
                    variant="gradient"
                    animated={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <ThemeToggle variant="icon" size="sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sidebarCollapsed && (
            <div className="flex flex-col items-center gap-2 mt-3">
              <AnimatedAvatar
                size="sm"
                fallback={user?.email || user?.name || 'U'}
                src={user?.avatar}
                variant="gradient"
                animated={false}
              />
              <ThemeToggle variant="icon" size="sm" />
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <HiChevronRight className="h-5 w-5" />
            ) : (
              <>
                <HiChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="min-h-screen pb-20 md:pb-0 relative z-10"
      >
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 glass px-4 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <HiBars3 className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-lg">{pageTitle}</h1>
            <ThemeToggle variant="icon" size="sm" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass rounded-t-3xl safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
            const Icon = isActive ? item.activeIcon : item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-0.5 w-12 h-1 rounded-full gradient-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
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
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                  className={cn(
                    'text-xs mt-1 font-medium',
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

      {/* Floating Action Button */}
      <FloatingActionButton
        position="bottom-right"
        variant="gradient"
        className="mb-20 md:mb-6"
        onClick={() => {
          // Navigate to create task
          window.location.href = '/dashboard/tasks'
        }}
      />
    </div>
  )
}
