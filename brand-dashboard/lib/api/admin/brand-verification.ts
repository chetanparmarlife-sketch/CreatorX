import { apiClient } from '@/lib/api/client'
import { BrandVerificationDocument, Page } from '@/lib/types'

export const adminBrandVerificationService = {
  async listPending(params?: {
    page?: number
    size?: number
    sortDir?: 'ASC' | 'DESC'
    sortBy?: string
  }): Promise<Page<BrandVerificationDocument>> {
    return apiClient.get<Page<BrandVerificationDocument>>('/brand-verification/pending', { params })
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
