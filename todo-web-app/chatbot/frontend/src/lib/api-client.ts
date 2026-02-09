/**
 * API client for connecting to the AI Chatbot backend
 */

import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ChatRequest {
  conversation_id?: number;
  message: string;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Send a chat message to the backend
   * @param userId The user ID
   * @param message The message to send
   * @param conversationId Optional conversation ID to continue an existing conversation
   * @returns Promise resolving to the chat response
   */
  async sendMessage(userId: string, message: string, conversationId?: number): Promise<ChatResponse> {
    try {
      const response = await axios.post<ChatResponse>(
        `${this.baseUrl}/api/${userId}/chat`,
        {
          conversation_id: conversationId,
          message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();