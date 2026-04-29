/**
 * Application service
 * Handles all application-related API operations
 */

import { apiClient } from '../client';
import { Application, Page } from '../types';
import { transformPage } from '@/src/utils/pagination';

export interface ApplicationRequest {
  campaignId: string;
  pitchText: string;
  availability?: string;
  expectedTimeline?: string;
  proposedBudget?: number;
}

export const applicationService = {
  /**
   * Submit application for a campaign
   * @param request - Application details
   * @returns Created application
   */
  async submitApplication(request: ApplicationRequest): Promise<Application> {
    return await apiClient.post<Application>('/applications', request);
  },

  /**
   * Get creator's applications with pagination
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @returns Paginated list of applications
   */
  async getApplications(
    page: number = 0,
    size: number = 20
  ): Promise<Page<Application>> {
    const response = await apiClient.get<any>('/applications', {
      params: { page, size },
    });
    // Spring sends { content, totalElements, totalPages }; application lists need normalized items.
    return transformPage<Application>(response);
  },

  /**
   * Get application by ID
   * @param id - Application ID
   * @returns Application details
   */
  async getApplicationById(id: string): Promise<Application> {
    return await apiClient.get<Application>(`/applications/${id}`);
  },

  /**
   * Withdraw application
   * @param id - Application ID
   */
  async withdrawApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`);
  },
};
