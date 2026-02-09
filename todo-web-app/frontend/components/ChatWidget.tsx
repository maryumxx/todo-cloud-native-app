'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatInterface from '@/components/chatbot/ChatInterface';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAuthToken(token);

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem('access_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Re-check token when widget opens
  useEffect(() => {
    if (isOpen) {
      setAuthToken(localStorage.getItem('access_token'));
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button - positioned above the Add Task FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-28 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[380px] h-[500px] rounded-2xl shadow-2xl border border-border bg-background overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Task Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface authToken={authToken} />
          </div>
        </div>
      )}
    </>
  );
}
