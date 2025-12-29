/**
 * Campaign API Service
 * 
 * Handles all campaign-related API operations.
 */

import { apiClient } from './client'
import { Campaign, CampaignCreateRequest, CampaignUpdateRequest, Page } from '@/lib/types'

export const campaignService = {
  /**
   * Get campaigns with filters and pagination
   */
  async getCampaigns(filters: any = {}, page = 0): Promise<Page<Campaign>> {
    return apiClient.get<Page<Campaign>>('/campaigns', {
      params: {
        ...filters,
        page,
        size: 10,
      },
    })
  },

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: number | string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/campaigns/${id}`)
  },

  /**
   * Create new campaign
   */
  async createCampaign(data: CampaignCreateRequest): Promise<Campaign> {
    return apiClient.post<Campaign>('/campaigns', data)
  },

  /**
   * Update campaign
   */
  async updateCampaign(id: string, data: CampaignUpdateRequest): Promise<Campaign> {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data)
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/campaigns/${id}`)
  },
}

