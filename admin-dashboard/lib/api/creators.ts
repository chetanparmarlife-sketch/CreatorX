import { apiClient } from './client'

export const creatorService = {
  async getCreators(params: {
    search?: string
    category?: string
    platform?: string
    minFollowers?: number
    maxFollowers?: number
    page: number
    size?: number
  }) {
    // Map frontend params to backend format
    const backendParams: Record<string, any> = {
      search: params.search,
      platform: params.platform, // Backend expects INSTAGRAM, YOUTUBE, etc.
      minFollowers: params.minFollowers,
      maxFollowers: params.maxFollowers,
      page: params.page,
      size: params.size || 20,
    }
    
    // Handle categories - backend accepts both repeated params and comma-separated
    if (params.category) {
      backendParams.category = params.category
    }
    
    // Note: engagementMin, engagementMax, location are not supported by backend
    // They are filtered client-side in the UI
    
    return apiClient.get('/creators', { params: backendParams })
  },
  async getCreatorById(id: string | number) {
    return apiClient.get(`/creators/${id}`)
  },
  async inviteToCampaign(campaignId: string | number, creatorId: string | number, message: string) {
    return apiClient.post(`/campaigns/${campaignId}/invite`, {
      creatorId,
      message,
    })
  },
}
