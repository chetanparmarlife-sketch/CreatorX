import { apiClient } from '@/lib/api/client'
import { DocumentStatus, KYCDocument, Page } from '@/lib/types'

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

  async bulkReview(documentIds: string[], status: DocumentStatus, reason?: string): Promise<BulkActionResponse> {
    return apiClient.post<BulkActionResponse>('/admin/bulk-actions', {
      actionType: 'KYC_REVIEW',
      entityIds: documentIds,
      status,
      reason,
    })
  },
}
