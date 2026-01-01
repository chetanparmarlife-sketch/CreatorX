import { apiClient } from '@/lib/api/client'
import { AdminApplicationDTO, Page } from '@/lib/types'

export type AdminApplicationsParams = {
  page?: number
  size?: number
  status?: string
  campaignId?: string
  brandId?: string
}

export const adminApplicationsService = {
  async listApplications(params?: AdminApplicationsParams): Promise<Page<AdminApplicationDTO>> {
    return apiClient.get<Page<AdminApplicationDTO>>('/admin/campaign-management/applications', { params })
  },

  async listCampaignApplications(
    campaignId: string,
    params?: { page?: number; size?: number; status?: string }
  ): Promise<Page<AdminApplicationDTO>> {
    return apiClient.get<Page<AdminApplicationDTO>>(
      `/admin/campaign-management/${campaignId}/applications`,
      { params }
    )
  },
}
