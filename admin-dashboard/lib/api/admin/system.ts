import { apiClient } from '@/lib/api/client'
import { AdminSummary, SystemHealthSummary } from '@/lib/types'

export const adminSystemService = {
  async getSummary(): Promise<AdminSummary> {
    return apiClient.get<AdminSummary>('/admin/system/summary')
  },

  async getHealthSummary(): Promise<SystemHealthSummary> {
    return apiClient.get<SystemHealthSummary>('/admin/system/health')
  },

  async trackSession(eventType?: string, path?: string): Promise<void> {
    await apiClient.post('/admin/system/session', { eventType, path })
  },

  async submitFeedback(rating: number, comment?: string): Promise<void> {
    await apiClient.post('/admin/system/feedback', { rating, comment })
  },
}
