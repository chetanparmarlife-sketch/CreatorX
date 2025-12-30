import { apiClient } from '@/lib/api/client'
import { DisputeTicket, Page } from '@/lib/types'

export const adminDisputeService = {
  async list(params?: { status?: string; type?: string; page?: number; size?: number }): Promise<Page<DisputeTicket>> {
    return apiClient.get<Page<DisputeTicket>>('/disputes/admin', { params })
  },

  async resolve(disputeId: string, status: string, resolution?: string): Promise<DisputeTicket> {
    return apiClient.put<DisputeTicket>(`/disputes/${disputeId}/resolve`, { status, resolution })
  },
}
