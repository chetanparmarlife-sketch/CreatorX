import { apiClient } from '@/lib/api/client'
import { BrandVerificationDocument } from '@/lib/types'

export const adminBrandVerificationService = {
  async listPending(): Promise<BrandVerificationDocument[]> {
    return apiClient.get<BrandVerificationDocument[]>('/brand-verification/pending')
  },

  async review(documentId: string, status: string, reason?: string): Promise<BrandVerificationDocument> {
    return apiClient.post<BrandVerificationDocument>(`/brand-verification/review/${documentId}`, {
      status,
      reason,
    })
  },

  async bulkReview(documentIds: string[], status: string, reason?: string): Promise<void> {
    await apiClient.post('/brand-verification/bulk-review', { documentIds, status, reason })
  },
}
