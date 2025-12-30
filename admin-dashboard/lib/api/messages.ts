/**
 * Messages API Service
 * 
 * Handles all message and conversation-related API operations.
 */

import { apiClient } from './client'
import { Conversation, Message, Page } from '@/lib/types'

export const messageService = {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[] | { conversations: Conversation[] }> {
    return apiClient.get<Conversation[] | { conversations: Conversation[] }>('/conversations')
  },

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    page: number = 0,
    size: number = 50
  ): Promise<Page<Message>> {
    return apiClient.get<Page<Message>>(`/conversations/${conversationId}/messages`, {
      params: { page, size },
    })
  },

  /**
   * Send a message (REST fallback)
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return apiClient.post<Message>(`/conversations/${conversationId}/messages`, {
      content,
    })
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    return apiClient.put(`/conversations/${conversationId}/mark-read`)
  },

  /**
   * Get conversation by application ID
   */
  async getConversationByApplication(applicationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/conversations/application/${applicationId}`)
  },
}
