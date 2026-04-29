/**
 * Deliverable service
 */

import { apiClient } from '../client';
import { APIError } from '../errors';
import {
  DeliverableSubmission,
  SubmitDeliverableRequest,
  PaginatedResponse,
} from '../types';
import { transformPage } from '@/src/utils/pagination';

export const deliverableService = {
  /**
   * Get deliverables for the current creator
   */
  async getDeliverables(page = 0, size = 20): Promise<PaginatedResponse<DeliverableSubmission>> {
    const response = await apiClient.get<any>(
      `/deliverables?page=${page}&size=${size}`
    );
    // Spring sends { content, totalElements, totalPages }; deliverable lists need normalized items.
    return transformPage<DeliverableSubmission>(response);
  },

  /**
   * Submit deliverable (file upload)
   */
  async submitDeliverable(
    applicationId: string,
    campaignDeliverableId: string,
    data: SubmitDeliverableRequest
  ): Promise<DeliverableSubmission> {
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    // Add description if provided
    if (data.description) {
      const trimmed = data.description.trim();
      if (trimmed.length < 20 || trimmed.length > 500) {
        throw new APIError(400, 'Description must be 20-500 characters.', 'VALIDATION_ERROR');
      }
      formData.append('description', trimmed);
    }

    formData.append('applicationId', applicationId);
    formData.append('campaignDeliverableId', campaignDeliverableId);

    return await apiClient.postFormData<DeliverableSubmission>(
      `/deliverables`,
      formData
    );
  },

  /**
   * Resubmit deliverable after revision
   */
  async resubmitDeliverable(
    deliverableId: string,
    data: SubmitDeliverableRequest
  ): Promise<DeliverableSubmission> {
    const formData = new FormData();
    
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    if (data.description) {
      const trimmed = data.description.trim();
      if (trimmed.length < 20 || trimmed.length > 500) {
        throw new APIError(400, 'Description must be 20-500 characters.', 'VALIDATION_ERROR');
      }
      formData.append('description', trimmed);
    }

    return await apiClient.put<DeliverableSubmission>(
      `/deliverables/${deliverableId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Get deliverable history
   */
  async getDeliverableHistory(deliverableId: string): Promise<DeliverableSubmission[]> {
    return await apiClient.get<DeliverableSubmission[]>(
      `/deliverables/${deliverableId}/history`
    );
  },
};
