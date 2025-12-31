import { apiClient } from '@/lib/api/client'
import { DisputeNote, DisputeTicket, DisputeEvidence, Page } from '@/lib/types'

export const adminDisputeService = {
  async list(params?: {
    status?: string
    type?: string
    sortDir?: 'ASC' | 'DESC'
    page?: number
    size?: number
  }): Promise<Page<DisputeTicket>> {
    return apiClient.get<Page<DisputeTicket>>('/disputes/admin', { params })
  },

  async getById(disputeId: string): Promise<DisputeTicket> {
    return apiClient.get<DisputeTicket>(`/disputes/admin/${disputeId}`)
  },

  async resolve(
    disputeId: string,
    status: string,
    resolution?: string,
    resolutionType?: string,
    actionAmount?: number
  ): Promise<DisputeTicket> {
    return apiClient.put<DisputeTicket>(`/disputes/${disputeId}/resolve`, {
      status,
      resolution,
      resolutionType,
      actionAmount,
    })
  },

  async assign(disputeId: string, adminId?: string, nextAction?: string): Promise<DisputeTicket> {
    return apiClient.put<DisputeTicket>(`/disputes/${disputeId}/assign`, { adminId, nextAction })
  },

  async listEvidence(disputeId: string): Promise<DisputeEvidence[]> {
    return apiClient.get<DisputeEvidence[]>(`/disputes/${disputeId}/evidence/admin`)
  },

  async addNote(disputeId: string, note: string): Promise<DisputeNote> {
    return apiClient.post<DisputeNote>(`/disputes/${disputeId}/notes`, { note })
  },

  async listNotes(disputeId: string): Promise<DisputeNote[]> {
    return apiClient.get<DisputeNote[]>(`/disputes/${disputeId}/notes`)
  },
}
