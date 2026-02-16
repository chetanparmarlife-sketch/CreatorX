/**
 * Campaign service
 * Handles all campaign-related API operations
 */

import { apiClient } from '../client';
import { Campaign, Page } from '../types';

export interface CampaignFilters {
  category?: string;
  platform?: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
}

export const campaignService = {
  /**
   * Get paginated campaigns with filters
   * @param filters - Filter criteria (category, platform, budget, status)
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @returns Paginated list of campaigns
   */
  async getCampaigns(
    filters: CampaignFilters = {},
    page: number = 0,
    size: number = 20
  ): Promise<Page<Campaign>> {
    const params: Record<string, string | number> = {
      page,
      size,
      ...filters,
    };

    // Remove undefined values
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return await apiClient.get<Page<Campaign>>('/campaigns', { params });
  },

  /**
   * Get campaign by ID
   * @param id - Campaign ID
   * @returns Campaign details
   */
  async getCampaignById(id: string): Promise<Campaign> {
    return await apiClient.get<Campaign>(`/campaigns/${id}`);
  },

  /**
   * Search campaigns by query string
   * @param query - Search query
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @returns Paginated list of matching campaigns
   */
  async searchCampaigns(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<Page<Campaign>> {
    return await apiClient.get<Page<Campaign>>('/campaigns', {
      params: { search: query, page, size },
    });
  },

  /**
   * Save campaign (bookmark for later)
   * @param id - Campaign ID
   */
  async saveCampaign(id: string): Promise<void> {
    await apiClient.post(`/campaigns/${id}/save`);
  },

  /**
   * Unsave campaign (remove bookmark)
   * @param id - Campaign ID
   */
  async unsaveCampaign(id: string): Promise<void> {
    await apiClient.delete(`/campaigns/${id}/save`);
  },

  /**
   * Get saved campaigns (bookmarked by current user)
   * @returns List of saved campaigns
   */
  async getSavedCampaigns(): Promise<Campaign[]> {
    return await apiClient.get<Campaign[]>('/campaigns/saved');
  },

  /**
   * Get active campaigns (campaigns where creator is selected)
   * @returns List of active campaigns
   */
  async getActiveCampaigns(): Promise<Campaign[]> {
    return await apiClient.get<Campaign[]>('/campaigns/active');
  },
};
