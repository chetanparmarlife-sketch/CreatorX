import { apiClient } from '@/lib/api/client'
import { BrandVerificationDetail, BrandVerificationDocument, Page } from '@/lib/types'

export interface BulkActionResult {
  entityId: string
  success: boolean
  message?: string
  updated?: unknown
}

export interface BulkActionResponse {
  actionType: string
  requested: number
  succeeded: number
  failed: number
  results: BulkActionResult[]
}

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

  async getDetail(documentId: string): Promise<BrandVerificationDetail> {
    return apiClient.get<BrandVerificationDetail>(`/brand-verification/admin/${documentId}`)
  },

  async bulkReview(documentIds: string[], status: string, reason?: string): Promise<BulkActionResponse> {
    return apiClient.post<BulkActionResponse>('/admin/bulk-actions', {
      actionType: 'BRAND_VERIFICATION',
      entityIds: documentIds,
      status,
      reason,
    })
  },
}
