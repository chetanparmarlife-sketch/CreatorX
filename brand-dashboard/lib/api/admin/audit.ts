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
    page?: number
    size?: number
  }): Promise<Page<AuditLogEntry>> {
    return apiClient.get<Page<AuditLogEntry>>('/admin/audit', { params })
  },
}
