import { apiClient } from '@/lib/api/client'
import { FinanceSummary } from '@/lib/types'

export const adminFinanceService = {
  async getSummary(params?: { from?: string; to?: string }): Promise<FinanceSummary> {
    return apiClient.get<FinanceSummary>('/admin/finance/summary', { params })
  },
}
