'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatApiClient } from '@/lib/chatbot/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  taskChanged?: boolean; // Flag to trigger task list refresh
}

interface ChatInterfaceProps {
  authToken: string | null;
  initialConversationId?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ authToken, initialConversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    if (!authToken) {
      setMessages((prev) => [...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: 'Please log in to manage your tasks.' }
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApiClient.sendMessage(authToken, message, conversationId);
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response, taskChanged: response.task_changed }]);

      // Dispatch event to refresh task list if tasks were modified
      if (response.task_changed) {
        window.dispatchEvent(new CustomEvent('tasks-updated'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {authToken ? 'Hi! I can help you manage your tasks.' : 'Please log in to manage tasks.'}
            </p>
            {authToken && (
              <p className="text-xs text-muted-foreground">
                Try: "Add buy groceries" or "Show my tasks"
              </p>
            )}
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:75ms]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
