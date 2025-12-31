/**
 * Messaging service
 */

import { apiClient } from '../client';
import {
  Conversation,
  Message,
  SendMessageRequest,
  PaginatedResponse,
} from '../types';

export const messagingService = {
  /**
   * Get conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/messages/conversations');
    return response;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, page = 0, size = 50): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
      `/messages/conversation/${conversationId}?page=${page}&size=${size}`
    );
  },

  /**
   * Send message in a conversation (REST fallback)
   * Note: WebSocket is preferred, this is for offline/fallback
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return await apiClient.post<Message>(
      `/messages/conversation/${conversationId}`,
      { content }
    );
  },

  /**
   * Mark conversation as read
   */
  async markConversationRead(conversationId: string): Promise<void> {
    await apiClient.put(`/messages/conversation/${conversationId}/read`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/messages/unread-count');
    return response || 0;
  },
};
