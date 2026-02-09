/**
 * Chat Interface component using OpenAI ChatKit
 * Matches existing app theme and styling
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'openai-chatkit/react';
import { apiClient } from '../../lib/api-client';

interface ChatInterfaceProps {
  userId: string;
  initialConversationId?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId, initialConversationId }) => {
  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use ChatKit for chat functionality
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput
  } = useChat({
    // Configure with backend endpoint
    api: `/api/${userId}/chat`,

    // Initial messages if needed
    initialMessages: [],

    // Callback for when messages are received
    onResponse: (response) => {
      console.log('Received response:', response);
    },

    // Callback for errors
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the message from input
    const message = input.trim();
    if (!message) return;

    try {
      // Send message via API client
      const response = await apiClient.sendMessage(userId, message, conversationId);

      // Update conversation ID if it changed
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Process tool calls if any
      if (response.tool_calls && response.tool_calls.length > 0) {
        // Handle tool call feedback (e.g., "Task created ✅")
        response.tool_calls.forEach(toolCall => {
          // You can customize this based on the tool call results
          console.log(`Tool call: ${toolCall.name}`, toolCall.arguments);
        });
      }

      // Clear input
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Task Assistant</h2>
        <p className="text-sm text-muted-foreground">
          {conversationId ? `Conversation #${conversationId}` : 'New conversation'}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Loading indicator when AI is thinking */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-1 border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;