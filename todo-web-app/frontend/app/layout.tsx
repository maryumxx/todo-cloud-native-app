import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '../lib/theme/theme-provider'
import { ToastProvider } from '../components/ui/toast'
import { ReconnectingIndicator } from '../components/ui/reconnecting-indicator'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Todo Web Application',
  description: 'A secure, multi-user todo application with authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning is applied to <body> because browser extensions
        (like Grammarly, password managers, etc.) inject attributes into the body
        tag after server rendering, causing hydration mismatches. This is safe
        because it only suppresses warnings for attributes on this specific element,
        not its children.
      */}
      <body suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="todo-app-theme">
          <ToastProvider>
            {children}
            <ReconnectingIndicator />
            <ChatWidget />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}