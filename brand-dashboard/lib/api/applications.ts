import { apiClient } from './client'
import { Application } from '@/lib/types'

export const applicationService = {
  async getCampaignApplications(
    campaignId: number | string,
    page: number = 0,
    size: number = 100
  ): Promise<Application[]> {
    return apiClient.get<Application[]>(`/campaigns/${campaignId}/applications`, {
      params: { page, size },
    })
  },
  async updateApplicationStatus(
    applicationId: number | string,
    status: string,
    reason?: string
  ) {
    return apiClient.put<Application>(`/applications/${applicationId}/status`, {
      status,
      reason,
    })
  },
  async rejectApplication(applicationId: number | string, reason: string) {
    // Backend accepts both JSON body and query param, prefer JSON body
    return apiClient.post<Application>(`/applications/${applicationId}/reject`, { reason })
  },
}
