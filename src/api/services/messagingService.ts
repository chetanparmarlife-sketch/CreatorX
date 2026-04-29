/**
 * Messaging service
 */

import { apiClient } from '../client';
import { Conversation, Message, PaginatedResponse } from '../types';
import { transformPage } from '@/src/utils/pagination';

export const messagingService = {
  /**
   * Get conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<any>('/conversations');
    // Backend may send { conversations } or a Spring page; normalize before chat list rendering.
    return response.conversations ?? transformPage<Conversation>(response).items;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, page = 0, size = 50): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<any>(
      `/conversations/${conversationId}/messages?page=${page}&size=${size}`
    );
    // Spring sends { content, totalElements, totalPages }; conversation screens need app-format messages.
    return transformPage<Message>(response);
  },

  /**
   * Send message in a conversation (REST fallback)
   * Note: WebSocket is preferred, this is for offline/fallback
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return await apiClient.post<Message>(
      `/conversations/${conversationId}/messages`,
      { text: content }
    );
  },

  /**
   * Mark conversation as read
   */
  async markConversationRead(conversationId: string): Promise<void> {
    await apiClient.put(`/conversations/${conversationId}/mark-read`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/conversations/unread-count');
    // The backend now exposes a real unread-count endpoint instead of deriving count from mock conversations.
    return response;
  },
};
