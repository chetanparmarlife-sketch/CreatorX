import { apiClient } from '@/lib/api/client'
import { GDPRRequest, GDPRRequestStatus, GDPRRequestType, Page } from '@/lib/types'

export const adminComplianceService = {
  async listRequests(params?: {
    status?: GDPRRequestStatus
    type?: GDPRRequestType
    page?: number
    size?: number
  }): Promise<Page<GDPRRequest>> {
    return apiClient.get<Page<GDPRRequest>>('/admin/compliance/gdpr', { params })
  },

  async updateRequest(
    requestId: string,
    payload: { status: GDPRRequestStatus; exportUrl?: string }
  ): Promise<GDPRRequest> {
    return apiClient.put<GDPRRequest>(`/admin/compliance/gdpr/${requestId}`, payload)
  },
}
