/**
 * KYC Service - Handles KYC document submission and status
 */

import { apiClient } from '../client';
import {
  KYCDocument,
  SubmitKYCRequest,
  DocumentType,
} from '../types';

export interface KYCStatusResponse {
  documents: KYCDocument[];
  isVerified: boolean;
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
}

export const kycService = {
  /**
   * Submit KYC document for verification
   */
  async submitKYC(data: SubmitKYCRequest & { documentNumber?: string }): Promise<KYCDocument> {
    const formData = new FormData();

    formData.append('documentType', data.documentType);

    if (data.documentNumber) {
      formData.append('documentNumber', data.documentNumber);
    }

    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type || 'image/jpeg',
      name: data.file.name || `kyc_${data.documentType}_${Date.now()}.jpg`,
    } as any);

    return await apiClient.postFormData<KYCDocument>('/kyc/submit', formData);
  },

  /**
   * Get all KYC documents and status
   */
  async getKYCStatus(): Promise<KYCStatusResponse> {
    return await apiClient.get<KYCStatusResponse>('/kyc/status');
  },

  /**
   * Get a specific KYC document
   */
  async getDocument(documentId: string): Promise<KYCDocument> {
    return await apiClient.get<KYCDocument>(`/kyc/documents/${documentId}`);
  },

  /**
   * Re-submit a rejected document
   */
  async resubmitDocument(
    documentId: string,
    file: { uri: string; type: string; name: string },
    documentNumber?: string
  ): Promise<KYCDocument> {
    const formData = new FormData();

    if (documentNumber) {
      formData.append('documentNumber', documentNumber);
    }

    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || `kyc_resubmit_${Date.now()}.jpg`,
    } as any);

    return await apiClient.postFormData<KYCDocument>(`/kyc/documents/${documentId}/resubmit`, formData);
  },
};
