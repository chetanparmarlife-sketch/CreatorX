import { apiClient } from '@/lib/api/client'
import { CampaignFlag, CampaignFlagStatus, ModerationRule, Page } from '@/lib/types'

export const adminModerationService = {
  async listRules(): Promise<ModerationRule[]> {
    return apiClient.get<ModerationRule[]>('/admin/moderation/rules')
  },

  async createRule(rule: Partial<ModerationRule>): Promise<ModerationRule> {
    return apiClient.post<ModerationRule>('/admin/moderation/rules', rule)
  },

  async updateRule(ruleId: string, rule: Partial<ModerationRule>): Promise<ModerationRule> {
    return apiClient.put<ModerationRule>(`/admin/moderation/rules/${ruleId}`, rule)
  },

  async deleteRule(ruleId: string): Promise<void> {
    await apiClient.delete(`/admin/moderation/rules/${ruleId}`)
  },

  async listFlags(params?: { status?: CampaignFlagStatus; page?: number; size?: number }): Promise<Page<CampaignFlag>> {
    return apiClient.get<Page<CampaignFlag>>('/admin/moderation/flags', { params })
  },

  async flagCampaign(payload: { campaignId: string; ruleId?: string; reason: string }): Promise<CampaignFlag> {
    return apiClient.post<CampaignFlag>('/admin/moderation/flags', payload)
  },

  async resolveFlag(
    flagId: string,
    payload: { status?: CampaignFlagStatus; notes?: string; removeCampaign?: boolean }
  ): Promise<CampaignFlag> {
    return apiClient.put<CampaignFlag>(`/admin/moderation/flags/${flagId}/resolve`, payload)
  },
}
