import { apiClient } from '@/lib/api/client'
import {
  Application,
  Campaign,
  CampaignCreateRequest,
  CampaignTemplate,
  CampaignUpdateRequest,
  DeliverableOverview,
  Page,
} from '@/lib/types'

export const adminCampaignManagementService = {
  async listCampaigns(params?: {
    brandId?: string
    category?: string
    platform?: string
    budgetMin?: number
    budgetMax?: number
    status?: string
    search?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    page?: number
    size?: number
  }): Promise<Page<Campaign>> {
    return apiClient.get<Page<Campaign>>('/admin/campaign-management', { params })
  },

  async getCampaign(campaignId: string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/admin/campaign-management/${campaignId}`)
  },

  async createCampaign(brandId: string, data: CampaignCreateRequest): Promise<Campaign> {
    return apiClient.post<Campaign>('/admin/campaign-management', data, { params: { brandId } })
  },

  async updateCampaign(campaignId: string, data: CampaignUpdateRequest): Promise<Campaign> {
    return apiClient.put<Campaign>(`/admin/campaign-management/${campaignId}`, data)
  },

  async deleteCampaign(campaignId: string): Promise<void> {
    await apiClient.delete(`/admin/campaign-management/${campaignId}`)
  },

  async inviteCreator(campaignId: string, creatorId: string, message?: string): Promise<Application> {
    return apiClient.post<Application>(`/admin/campaign-management/${campaignId}/invite`, {
      creatorId,
      message,
    })
  },

  async listApplications(
    campaignId: string,
    params?: { page?: number; size?: number; sortBy?: string; sortDirection?: 'asc' | 'desc' }
  ): Promise<Page<Application>> {
    return apiClient.get<Page<Application>>(`/admin/campaign-management/${campaignId}/applications`, { params })
  },

  async listApplicationsAdmin(params?: {
    brandId?: string
    campaignId?: string
    status?: string
    page?: number
    size?: number
  }): Promise<Page<Application>> {
    return apiClient.get<Page<Application>>(`/admin/campaign-management/applications`, { params })
  },

  async shortlistApplication(applicationId: string): Promise<void> {
    await apiClient.post(`/admin/campaign-management/applications/${applicationId}/shortlist`)
  },

  async selectApplication(applicationId: string): Promise<void> {
    await apiClient.post(`/admin/campaign-management/applications/${applicationId}/select`)
  },

  async rejectApplication(applicationId: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/campaign-management/applications/${applicationId}/reject`, { reason })
  },

  async updateApplicationStatus(applicationId: string, status: string, reason?: string): Promise<void> {
    await apiClient.put(`/admin/campaign-management/applications/${applicationId}/status`, { status, reason })
  },

  async bulkUpdateApplications(applicationIds: string[], status: string, reason?: string): Promise<void> {
    await apiClient.post(`/admin/campaign-management/applications/bulk-status`, {
      applicationIds,
      status,
      reason,
    })
  },

  async listDeliverables(campaignId: string, status?: string): Promise<DeliverableOverview[]> {
    return apiClient.get<DeliverableOverview[]>(`/admin/campaign-management/${campaignId}/deliverables`, {
      params: { status },
    })
  },

  async listDeliverablesAdmin(params?: {
    brandId?: string
    campaignId?: string
    status?: string
    page?: number
    size?: number
  }): Promise<Page<DeliverableOverview>> {
    return apiClient.get<Page<DeliverableOverview>>(`/admin/campaign-management/deliverables`, { params })
  },

  async reviewDeliverable(submissionId: string, status: string, feedback?: string): Promise<void> {
    await apiClient.post(`/admin/campaign-management/deliverables/${submissionId}/review`, {
      status,
      feedback,
    })
  },

  async listTemplates(brandId: string): Promise<CampaignTemplate[]> {
    return apiClient.get<CampaignTemplate[]>(`/admin/campaign-management/templates`, { params: { brandId } })
  },

  async getTemplate(templateId: string): Promise<CampaignTemplate> {
    return apiClient.get<CampaignTemplate>(`/admin/campaign-management/templates/${templateId}`)
  },

  async createTemplate(brandId: string, data: CampaignTemplate): Promise<CampaignTemplate> {
    return apiClient.post<CampaignTemplate>(`/admin/campaign-management/templates`, data, { params: { brandId } })
  },

  async createTemplateFromCampaign(brandId: string, campaignId: string): Promise<CampaignTemplate> {
    return apiClient.post<CampaignTemplate>(
      `/admin/campaign-management/templates/from-campaign/${campaignId}`,
      null,
      { params: { brandId } }
    )
  },

  async updateTemplate(templateId: string, data: CampaignTemplate): Promise<CampaignTemplate> {
    return apiClient.put<CampaignTemplate>(`/admin/campaign-management/templates/${templateId}`, data)
  },

  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/admin/campaign-management/templates/${templateId}`)
  },
}
