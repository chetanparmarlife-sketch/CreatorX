import { apiClient } from '@/lib/api/client'
import { Campaign, Page } from '@/lib/types'

export const adminCampaignReviewService = {
  async listPending(params?: { sortDir?: 'ASC' | 'DESC'; page?: number; size?: number }): Promise<Page<Campaign>> {
    return apiClient.get<Page<Campaign>>('/admin/campaigns/pending', { params })
  },

  async approve(campaignId: string): Promise<Campaign> {
    return apiClient.put<Campaign>(`/admin/campaigns/${campaignId}/approve`)
  },

  async reject(campaignId: string, reason: string): Promise<Campaign> {
    return apiClient.put<Campaign>(`/admin/campaigns/${campaignId}/reject`, { reason })
  },
}
