/**
 * Deliverable service
 */

import { apiClient } from '../client';
import {
  DeliverableSubmission,
  SubmitDeliverableRequest,
  PaginatedResponse,
} from '../types';

export const deliverableService = {
  /**
   * Get deliverables for the current creator
   */
  async getDeliverables(page = 0, size = 20): Promise<PaginatedResponse<DeliverableSubmission>> {
    return await apiClient.get<PaginatedResponse<DeliverableSubmission>>(
      `/deliverables?page=${page}&size=${size}`
    );
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
      formData.append('description', data.description);
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
      formData.append('description', data.description);
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

