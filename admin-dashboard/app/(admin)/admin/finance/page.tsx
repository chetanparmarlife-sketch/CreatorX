'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminFinanceService } from '@/lib/api/admin/finance'
import { FinanceReportGroup, FinanceReportPeriod, TransactionStatus, TransactionType } from '@/lib/types'
import { ActionBar } from '@/components/shared/action-bar'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { StatusChip } from '@/components/shared/status-chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const formatValue = (value: number | string | undefined) => {
  if (value === undefined || value === null) return '—'
  return value
}

export default function AdminFinancePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [groupBy, setGroupBy] = useState<FinanceReportGroup>('PERIOD')
  const [period, setPeriod] = useState<FinanceReportPeriod>('DAY')
  const [includeFlags, setIncludeFlags] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
    type: '',
    status: '',
    groupBy: 'PERIOD' as FinanceReportGroup,
    period: 'DAY' as FinanceReportPeriod,
    includeFlags: false,
  })
  const [reportPage, setReportPage] = useState(0)
  const [reportPageSize, setReportPageSize] = useState(10)
  const [selectedRow, setSelectedRow] = useState<any | null>(null)

  const summaryParams = useMemo(() => {
    return {
      from: appliedFilters.from ? new Date(appliedFilters.from).toISOString() : undefined,
      to: appliedFilters.to ? new Date(appliedFilters.to).toISOString() : undefined,
    }
  }, [appliedFilters.from, appliedFilters.to])

  const reportParams = useMemo(() => {
    return {
      from: summaryParams.from,
      to: summaryParams.to,
      type: appliedFilters.type || undefined,
      status: appliedFilters.status || undefined,
      period: appliedFilters.groupBy === 'PERIOD' ? appliedFilters.period : undefined,
    }
  }, [summaryParams, appliedFilters])

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['admin-finance-summary', summaryParams],
    queryFn: () => adminFinanceService.getSummary(summaryParams),
  })

  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['admin-finance-report', appliedFilters.groupBy, reportParams],
    queryFn: async (): Promise<unknown[]> => {
      if (appliedFilters.groupBy === 'USER') {
        return adminFinanceService.getUserReport(reportParams)
      }
      if (appliedFilters.groupBy === 'CAMPAIGN') {
        return adminFinanceService.getCampaignReport(reportParams)
      }
      return adminFinanceService.getPeriodReport(reportParams)
    },
  })

  const reportItems = useMemo(() => (reportData as any[]) ?? [], [reportData])
  const reportTotalPages = Math.max(1, Math.ceil(reportItems.length / reportPageSize))
  const pagedItems = reportItems.slice(
    reportPage * reportPageSize,
    reportPage * reportPageSize + reportPageSize
  )

  const getAnomalyLabel = (row: any) => {
    if (row.transactionCount === 0) return 'No activity'
    if (row.totalAmount < 0) return 'Negative total'
    if (row.totalAmount >= 1_000_000) return 'High volume'
    if (row.transactionCount >= 200) return 'High count'
    return null
  }

  const items = [
    { label: 'Total Earnings', value: summary?.totalEarnings ?? 0 },
    { label: 'Total Withdrawals', value: summary?.totalWithdrawals ?? 0 },
    { label: 'Total Refunds', value: summary?.totalRefunds ?? 0 },
    { label: 'Total Penalties', value: summary?.totalPenalties ?? 0 },
    { label: 'Pending Payouts', value: summary?.pendingPayouts ?? 0 },
    { label: 'Transactions', value: summary?.totalTransactions ?? 0 },
  ]

  const handleExport = async () => {
    const blob = await adminFinanceService.exportReport({
      groupBy: appliedFilters.groupBy,
      includeFlags: appliedFilters.includeFlags,
      ...reportParams,
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'finance-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="Finance"
        subtitle="Reconciliation overview for platform payouts."
        eyebrow="Finance"
      >

      <div className="section-card grid gap-4 md:grid-cols-6">
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          type="datetime-local"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          type="datetime-local"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">All Types</option>
          {Object.values(TransactionType).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.values(TransactionStatus).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as FinanceReportGroup)}
        >
          <option value="PERIOD">Group by Period</option>
          <option value="USER">Group by User</option>
          <option value="CAMPAIGN">Group by Campaign</option>
        </select>
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={period}
          onChange={(event) => setPeriod(event.target.value as FinanceReportPeriod)}
          disabled={groupBy !== 'PERIOD'}
        >
          <option value="DAY">Daily</option>
          <option value="WEEK">Weekly</option>
          <option value="MONTH">Monthly</option>
        </select>
        <div className="md:col-span-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeFlags}
              onChange={(event) => setIncludeFlags(event.target.checked)}
            />
            Include reconciliation flags
          </label>
          <button
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            onClick={() => {
              setAppliedFilters({
                from,
                to,
                type,
                status,
                groupBy,
                period,
                includeFlags,
              })
              setReportPage(0)
            }}
          >
            Apply filters
          </button>
          <button
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
            onClick={handleExport}
          >
            Export last applied filters
          </button>
        </div>
      </div>

      <ActionBar
        title="Applied filters"
        description="Report exports use the last applied filters."
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info" size="compact">
            {appliedFilters.groupBy}
          </StatusChip>
          {appliedFilters.period && appliedFilters.groupBy === 'PERIOD' ? (
            <StatusChip tone="info" size="compact">
              {appliedFilters.period}
            </StatusChip>
          ) : null}
          {appliedFilters.type ? (
            <StatusChip tone="info" size="compact">
              {appliedFilters.type}
            </StatusChip>
          ) : null}
          {appliedFilters.status ? (
            <StatusChip tone="info" size="compact">
              {appliedFilters.status}
            </StatusChip>
          ) : null}
          {appliedFilters.from || appliedFilters.to ? (
            <StatusChip tone="info" size="compact">
              {appliedFilters.from ? new Date(appliedFilters.from).toLocaleDateString() : 'Any'} →{' '}
              {appliedFilters.to ? new Date(appliedFilters.to).toLocaleDateString() : 'Any'}
            </StatusChip>
          ) : null}
          {appliedFilters.includeFlags ? (
            <StatusChip tone="needs_action" size="compact">
              Flags enabled
            </StatusChip>
          ) : (
            <StatusChip tone="pending" size="compact">
              Flags off
            </StatusChip>
          )}
        </div>
      </ActionBar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="section-card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {isSummaryLoading ? '—' : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="table-shell p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Detailed Reports</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{appliedFilters.groupBy}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Rows</label>
            <select
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
              value={reportPageSize}
              onChange={(event) => {
                setReportPageSize(Number(event.target.value))
                setReportPage(0)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Showing {reportItems.length ? reportPage * reportPageSize + 1 : 0}-
            {Math.min(reportItems.length, (reportPage + 1) * reportPageSize)} of {reportItems.length}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="table-compact w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                {appliedFilters.groupBy === 'PERIOD' ? (
                  <>
                    <th className="py-2 pr-4">Period Start</th>
                    <th className="py-2 pr-4">Period End</th>
                  </>
                ) : null}
                {appliedFilters.groupBy === 'USER' ? (
                  <>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Email</th>
                  </>
                ) : null}
                {appliedFilters.groupBy === 'CAMPAIGN' ? (
                  <>
                    <th className="py-2 pr-4">Campaign</th>
                    <th className="py-2 pr-4">Title</th>
                  </>
                ) : null}
                <th className="py-2 pr-4">Transactions</th>
                <th className="py-2 pr-4">Total Amount</th>
                <th className="py-2 pr-4">Anomaly</th>
                <th className="py-2 pr-4">Flags</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isReportLoading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : pagedItems.length ? (
                pagedItems.map((row, index) => {
                  const anomaly = getAnomalyLabel(row)
                  return (
                    <tr key={index} className="border-t border-slate-100">
                      {appliedFilters.groupBy === 'PERIOD' ? (
                        <>
                          <td className="py-3 pr-4">
                            {row.periodStart ? new Date(row.periodStart).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 pr-4">
                            {row.periodEnd ? new Date(row.periodEnd).toLocaleString() : '—'}
                          </td>
                        </>
                      ) : null}
                      {appliedFilters.groupBy === 'USER' ? (
                        <>
                          <td className="py-3 pr-4">{row.userId}</td>
                          <td className="py-3 pr-4">{row.userEmail || '—'}</td>
                        </>
                      ) : null}
                      {appliedFilters.groupBy === 'CAMPAIGN' ? (
                        <>
                          <td className="py-3 pr-4">{row.campaignId}</td>
                          <td className="py-3 pr-4">{row.campaignTitle || '—'}</td>
                        </>
                      ) : null}
                      <td className="py-3 pr-4">{formatValue(row.transactionCount)}</td>
                      <td className="py-3 pr-4">{formatValue(row.totalAmount)}</td>
                      <td className="py-3 pr-4">
                        {anomaly ? (
                          <StatusChip tone="needs_action" size="compact">
                            {anomaly}
                          </StatusChip>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {appliedFilters.includeFlags && anomaly ? (
                          <StatusChip tone="needs_action" size="compact">
                            Review
                          </StatusChip>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          onClick={() => setSelectedRow(row)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No report data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <button
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            disabled={reportPage === 0}
            onClick={() => setReportPage((prev) => Math.max(0, prev - 1))}
          >
            Previous
          </button>
          <p className="text-xs text-slate-500">
            Page {reportPage + 1} of {reportTotalPages}
          </p>
          <button
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            disabled={reportPage + 1 >= reportTotalPages}
            onClick={() => setReportPage((prev) => Math.min(reportTotalPages - 1, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>
      </DashboardPageShell>

      <Dialog
        open={!!selectedRow}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRow(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report detail</DialogTitle>
            <DialogDescription>Drill into this aggregate before reconciling.</DialogDescription>
          </DialogHeader>
          {selectedRow ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 md:grid-cols-2">
                {appliedFilters.groupBy === 'PERIOD' ? (
                  <>
                    <div>
                      <p className="text-xs uppercase text-slate-400">Period start</p>
                      <p className="text-sm text-slate-700">
                        {selectedRow.periodStart ? new Date(selectedRow.periodStart).toLocaleString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">Period end</p>
                      <p className="text-sm text-slate-700">
                        {selectedRow.periodEnd ? new Date(selectedRow.periodEnd).toLocaleString() : '—'}
                      </p>
                    </div>
                  </>
                ) : null}
                {appliedFilters.groupBy === 'USER' ? (
                  <>
                    <div>
                      <p className="text-xs uppercase text-slate-400">User</p>
                      <p className="text-sm text-slate-700">{selectedRow.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">Email</p>
                      <p className="text-sm text-slate-700">{selectedRow.userEmail || '—'}</p>
                    </div>
                  </>
                ) : null}
                {appliedFilters.groupBy === 'CAMPAIGN' ? (
                  <>
                    <div>
                      <p className="text-xs uppercase text-slate-400">Campaign</p>
                      <p className="text-sm text-slate-700">{selectedRow.campaignId}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">Title</p>
                      <p className="text-sm text-slate-700">{selectedRow.campaignTitle || '—'}</p>
                    </div>
                  </>
                ) : null}
                <div>
                  <p className="text-xs uppercase text-slate-400">Transactions</p>
                  <p className="text-sm text-slate-700">{formatValue(selectedRow.transactionCount)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Total amount</p>
                  <p className="text-sm text-slate-700">{formatValue(selectedRow.totalAmount)}</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Recommended next step: export detailed transactions for this aggregate and reconcile flagged items.
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedRow(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
