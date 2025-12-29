/**
 * KYC service
 */

import { apiClient } from '../client';
import {
  KYCDocument,
  SubmitKYCRequest,
} from '../types';

export const kycService = {
  /**
   * Submit KYC document
   */
  async submitKYC(data: SubmitKYCRequest): Promise<KYCDocument> {
    const formData = new FormData();
    
    formData.append('documentType', data.documentType);
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    return await apiClient.postFormData<KYCDocument>('/kyc/submit', formData);
  },

  /**
   * Get KYC status
   */
  async getKYCStatus(): Promise<KYCDocument[]> {
    return await apiClient.get<KYCDocument[]>('/kyc/status');
  },
};

