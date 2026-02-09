/**
 * API client for connecting to the AI Chatbot endpoint
 * Now integrated into the main backend (same URL as main API)
 */

import axios from 'axios';

// Use the same backend URL as the main app (chatbot is now part of main backend)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: { name: string; arguments: Record<string, unknown>; result?: Record<string, unknown> }[];
  task_changed: boolean; // Indicates if tasks were modified (for UI refresh)
}

class ChatApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Send a chat message to the chatbot endpoint (now part of main backend)
   * @param authToken - JWT token from main app
   * @param message - User's message
   * @param conversationId - Optional conversation ID for context
   */
  async sendMessage(authToken: string, message: string, conversationId?: number): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(
      `${this.baseUrl}/api/chat`,
      { conversation_id: conversationId, message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  }
}

export const chatApiClient = new ChatApiClient();
