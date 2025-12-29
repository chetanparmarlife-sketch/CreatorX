import { apiClient } from './client'

export type AnalyticsRange = '7d' | '30d' | 'all'

export const analyticsService = {
  async getCampaignAnalytics(campaignId: number | string, range: AnalyticsRange) {
    return apiClient.get(`/campaigns/${campaignId}/analytics`, {
      params: {
        range,
      },
    })
  },
}
