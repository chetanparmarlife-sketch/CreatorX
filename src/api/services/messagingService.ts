/**
 * Messaging service
 */

import { apiClient } from '../client';
import { Conversation, Message, PaginatedResponse } from '../types';

export const messagingService = {
  /**
   * Get conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations?: Conversation[] }>('/conversations');
    return response.conversations ?? [];
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, page = 0, size = 50): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
      `/conversations/${conversationId}/messages?page=${page}&size=${size}`
    );
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
    const response = await apiClient.get<{ conversations?: Conversation[] }>('/conversations');
    const conversations = response.conversations ?? [];
    return conversations.reduce((sum, convo) => sum + ((convo as any).unreadCount ?? 0), 0);
  },
};
