import { apiClient } from './client'

export type DeliverableReviewStatus = 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'

export const deliverableService = {
  async getCampaignDeliverables(
    campaignId: number | string,
    status?: DeliverableReviewStatus
  ) {
    return apiClient.get(`/campaigns/${campaignId}/deliverables`, {
      params: status ? { status } : {},
    })
  },
  async getBrandDeliverables(status?: DeliverableReviewStatus) {
    return apiClient.get('/deliverables', {
      params: status ? { status } : {},
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
