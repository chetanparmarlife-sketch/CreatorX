import { apiClient } from '@/lib/api/client'
import { DocumentStatus, KYCDocument } from '@/lib/types'

export const adminKycService = {
  async listPending(): Promise<KYCDocument[]> {
    return apiClient.get<KYCDocument[]>('/kyc/pending')
  },

  async approve(documentId: string): Promise<void> {
    await apiClient.put(`/kyc/documents/${documentId}/approve`)
  },

  async reject(documentId: string, reason: string): Promise<void> {
    await apiClient.put(`/kyc/documents/${documentId}/reject`, null, { params: { reason } })
  },

  async bulkReview(documentIds: string[], status: DocumentStatus, reason?: string): Promise<void> {
    await apiClient.post('/kyc/documents/bulk-review', { documentIds, status, reason })
  },
}
