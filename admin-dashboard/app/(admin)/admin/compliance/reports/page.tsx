'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminComplianceReportService } from '@/lib/api/admin/compliance-reports'
import { ComplianceReportStatus, ComplianceReportType } from '@/lib/types'
import { Pagination } from '@/components/shared/pagination'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'

const reportTypes = Object.values(ComplianceReportType)
const reportStatuses = Object.values(ComplianceReportStatus)

export default function AdminComplianceReportsPage() {
  const queryClient = useQueryClient()
  const { toasts, pushToast, dismissToast } = useToast()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [region, setRegion] = useState('GLOBAL')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-compliance-reports', page, sortDir, typeFilter, statusFilter, regionFilter],
    queryFn: () =>
      adminComplianceReportService.listReports({
        page,
        size: 20,
        sortDir,
        type: typeFilter ? (typeFilter as ComplianceReportType) : undefined,
        status: statusFilter ? (statusFilter as ComplianceReportStatus) : undefined,
        region: regionFilter || undefined,
      }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const taxMutation = useMutation({
    mutationFn: () =>
      adminComplianceReportService.generateTaxReport({
        region,
        periodStart: periodStart ? new Date(periodStart).toISOString() : undefined,
        periodEnd: periodEnd ? new Date(periodEnd).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-compliance-reports'] })
      pushToast('Tax report generated', 'success')
    },
    onError: () => pushToast('Tax report generation failed', 'error'),
  })

  const regulatoryMutation = useMutation({
    mutationFn: () =>
      adminComplianceReportService.generateRegulatoryReport({
        region,
        periodStart: periodStart ? new Date(periodStart).toISOString() : undefined,
        periodEnd: periodEnd ? new Date(periodEnd).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-compliance-reports'] })
      pushToast('Regulatory report generated', 'success')
    },
    onError: () => pushToast('Regulatory report generation failed', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="Compliance Reports"
        subtitle="Generate and review tax documents and regulatory exports."
        eyebrow="Compliance"
      >
      <div className="section-card">
        <h2 className="text-lg font-semibold text-slate-900">Generate Report</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Region (e.g., IN, EU)"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            type="datetime-local"
            value={periodStart}
            onChange={(event) => setPeriodStart(event.target.value)}
          />
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            type="datetime-local"
            value={periodEnd}
            onChange={(event) => setPeriodEnd(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={() => taxMutation.mutate()}
            >
              Tax Doc
            </button>
            <button
              className="h-10 flex-1 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => regulatoryMutation.mutate()}
            >
              Regulatory
            </button>
          </div>
        </div>
      </div>

      <div className="table-shell p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All Types</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All Statuses</option>
              {reportStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
              placeholder="Region filter"
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Region</th>
                <th className="py-2 pr-4">Period</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((report: any) => (
                  <tr key={report.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{report.reportType}</td>
                    <td className="py-3 pr-4">{report.region}</td>
                    <td className="py-3 pr-4">
                      {report.periodStart ? new Date(report.periodStart).toLocaleDateString() : '—'} →{' '}
                      {report.periodEnd ? new Date(report.periodEnd).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4">{report.status}</td>
                    <td className="py-3 pr-4">
                      {report.signedUrl ? (
                        <a
                          className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                          href={report.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No compliance reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      </DashboardPageShell>
    </div>
  )
}
