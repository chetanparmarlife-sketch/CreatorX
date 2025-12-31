import { apiClient } from '@/lib/api/client'
import {
  ComplianceReport,
  ComplianceReportStatus,
  ComplianceReportType,
  Page,
} from '@/lib/types'

export const adminComplianceReportService = {
  async listReports(params?: {
    type?: ComplianceReportType
    status?: ComplianceReportStatus
    region?: string
    sortDir?: 'ASC' | 'DESC'
    page?: number
    size?: number
  }): Promise<Page<ComplianceReport>> {
    return apiClient.get<Page<ComplianceReport>>('/admin/compliance/reports', { params })
  },

  async generateTaxReport(payload: { region: string; periodStart?: string; periodEnd?: string }): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>('/admin/compliance/reports/tax', payload)
  },

  async generateRegulatoryReport(payload: { region: string; periodStart?: string; periodEnd?: string }): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>('/admin/compliance/reports/regulatory', payload)
  },
}
