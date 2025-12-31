import { apiClient } from '@/lib/api/client'
import { DocumentStatus, KYCDocument, Page } from '@/lib/types'

export const adminKycService = {
  async listPending(params?: {
    page?: number
    size?: number
    sortDir?: 'ASC' | 'DESC'
    sortBy?: string
  }): Promise<Page<KYCDocument>> {
    return apiClient.get<Page<KYCDocument>>('/kyc/pending', { params })
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
