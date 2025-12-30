import { apiClient } from '@/lib/api/client'
import { AdminSummary } from '@/lib/types'

export const adminSystemService = {
  async getSummary(): Promise<AdminSummary> {
    return apiClient.get<AdminSummary>('/admin/system/summary')
  },
}
