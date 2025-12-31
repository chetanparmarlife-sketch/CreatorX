import { apiClient } from '@/lib/api/client'
import { Conversation, Message, Page } from '@/lib/types'

export const adminMessageService = {
  async listConversations(page: number = 0, size: number = 50): Promise<Page<Conversation>> {
    return apiClient.get<Page<Conversation>>('/admin/messages/conversations', { params: { page, size } })
  },

  async getMessages(conversationId: string, page: number = 0, size: number = 50): Promise<Page<Message>> {
    return apiClient.get<Page<Message>>(`/admin/messages/conversations/${conversationId}/messages`, {
      params: { page, size },
    })
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return apiClient.post<Message>(`/admin/messages/conversations/${conversationId}/messages`, { content })
  },
}
