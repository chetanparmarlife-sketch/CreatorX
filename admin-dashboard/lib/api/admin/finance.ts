import { apiClient } from '@/lib/api/client'
import {
  FinanceCampaignReportRow,
  FinancePeriodReportRow,
  FinanceReportGroup,
  FinanceReportPeriod,
  FinanceSummary,
  FinanceUserReportRow,
} from '@/lib/types'

export const adminFinanceService = {
  async getSummary(params?: { from?: string; to?: string }): Promise<FinanceSummary> {
    return apiClient.get<FinanceSummary>('/admin/finance/summary', { params })
  },

  async getUserReport(params?: { from?: string; to?: string; type?: string; status?: string }): Promise<FinanceUserReportRow[]> {
    return apiClient.get<FinanceUserReportRow[]>('/admin/finance/reports/users', { params })
  },

  async getCampaignReport(params?: { from?: string; to?: string; type?: string; status?: string }): Promise<FinanceCampaignReportRow[]> {
    return apiClient.get<FinanceCampaignReportRow[]>('/admin/finance/reports/campaigns', { params })
  },

  async getPeriodReport(params?: {
    from?: string
    to?: string
    type?: string
    status?: string
    period?: FinanceReportPeriod
  }): Promise<FinancePeriodReportRow[]> {
    return apiClient.get<FinancePeriodReportRow[]>('/admin/finance/reports/period', { params })
  },

  async exportReport(params: {
    groupBy: FinanceReportGroup
    from?: string
    to?: string
    type?: string
    status?: string
    period?: FinanceReportPeriod
    includeFlags?: boolean
  }): Promise<Blob> {
    return apiClient.getBlob('/admin/finance/reports/export', { params })
  },
}
