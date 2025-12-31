import { apiClient } from '@/lib/api/client'
import { AuditLogEntry, Page } from '@/lib/types'

export const adminAuditService = {
  async list(params?: {
    adminId?: string
    actionType?: string
    entityType?: string
    entityId?: string
    from?: string
    to?: string
    sortDir?: 'ASC' | 'DESC'
    page?: number
    size?: number
  }): Promise<Page<AuditLogEntry>> {
    return apiClient.get<Page<AuditLogEntry>>('/admin/audit', { params })
  },

  async exportCsv(params?: {
    adminId?: string
    actionType?: string
    entityType?: string
    entityId?: string
    from?: string
    to?: string
  }): Promise<Blob> {
    return apiClient.getBlob('/admin/audit/export', { params })
  },
}
