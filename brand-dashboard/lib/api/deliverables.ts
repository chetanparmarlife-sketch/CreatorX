import { apiClient } from './client'
import type { Page } from '@/lib/types'

export type DeliverableReviewStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'

export const deliverableService = {
  async getCampaignDeliverables(
    campaignId: number | string,
    status?: DeliverableReviewStatus
  ) {
    return apiClient.get(`/campaigns/${campaignId}/deliverables`, {
      params: status ? { status } : {},
    })
  },
  async getBrandDeliverables(params?: {
    status?: DeliverableReviewStatus
    page?: number
    size?: number
  }) {
    return apiClient.get<Page<any>>('/deliverables', {
      params: {
        status: params?.status,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    })
  },
  async reviewDeliverable(
    deliverableId: number | string,
    status: DeliverableReviewStatus,
    feedback: string
  ) {
    // Backend uses POST, not PUT
    return apiClient.post(`/deliverables/${deliverableId}/review`, { status, feedback })
  },
  async getDeliverableHistory(deliverableId: number | string) {
    return apiClient.get(`/deliverables/${deliverableId}/history`)
  },
}
