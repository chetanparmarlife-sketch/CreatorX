import { apiClient } from './client'
import { CampaignTemplate } from '@/lib/types'

export const templateService = {
  async getTemplates(): Promise<CampaignTemplate[]> {
    return apiClient.get('/campaign-templates')
  },
  async getTemplate(id: string): Promise<CampaignTemplate> {
    return apiClient.get(`/campaign-templates/${id}`)
  },
  async createTemplate(payload: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    return apiClient.post('/campaign-templates', payload)
  },
  async createTemplateFromCampaign(campaignId: string): Promise<CampaignTemplate> {
    return apiClient.post(`/campaign-templates/from-campaign/${campaignId}`)
  },
  async updateTemplate(id: string, payload: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    return apiClient.put(`/campaign-templates/${id}`, payload)
  },
  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`/campaign-templates/${id}`)
  },
}
