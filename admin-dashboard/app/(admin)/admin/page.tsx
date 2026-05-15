'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Users,
  FileCheck,
  Building2,
  AlertTriangle,
  Flag,
  Scale,
  ClipboardList,
  Star,
} from 'lucide-react'
import { StatCardsSkeleton } from '@/components/shared/skeleton'
import { adminSystemService } from '@/lib/api/admin/system'
import { adminFinanceService } from '@/lib/api/admin/finance'
import { adminWorkspaceService } from '@/lib/api/admin/workspace'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'

export default function AdminOverviewPage() {
  const [csatRating, setCsatRating] = useState<number | null>(null)
  const [csatComment, setCsatComment] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [statsPage, setStatsPage] = useState(0)
  const [showAllStats, setShowAllStats] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-system-summary'],
    queryFn: () => adminSystemService.getSummary(),
    placeholderData: (previousData) => previousData,
  })
  const { data: workspaceSummary, isLoading: workspaceLoading } = useQuery({
    queryKey: ['admin-workspace-summary'],
    queryFn: () => adminWorkspaceService.getSummary(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
  const { data: actionQueueData } = useQuery({
    queryKey: ['admin-action-queue', 0],
    queryFn: () => adminWorkspaceService.getActionQueue(0, 6),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
  const { data: financeSummary } = useQuery({
    queryKey: ['admin-finance-summary-overview'],
    queryFn: () => adminFinanceService.getSummary(),
  })

  useEffect(() => {
    const lastPrompt = localStorage.getItem('admin_csat_last')
    if (!lastPrompt) {
      setShowFeedback(true)
      return
    }
    const lastDate = new Date(lastPrompt)
    const diffDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays >= 14) {
      setShowFeedback(true)
    }
  }, [])

  const stats = useMemo(() => {
    const growthLabel =
      data?.userGrowthPercent !== undefined
        ? `${data.userGrowthPercent >= 0 ? '+' : ''}${data.userGrowthPercent.toFixed(1)}% MoM`
        : '—'
    return [
      { label: 'Total Users', value: data?.totalUsers ?? '—', icon: Users, color: 'bg-slate-900 text-white', helper: growthLabel },
      { label: 'Brands', value: data?.totalBrands ?? '—', icon: Building2, color: 'bg-blue-600 text-white' },
      { label: 'Total Campaigns', value: data?.totalCampaigns ?? '—', icon: Flag, color: 'bg-emerald-600 text-white' },
      { label: 'Payouts', value: financeSummary?.totalWithdrawals ?? '—', icon: ClipboardList, color: 'bg-indigo-600 text-white' },
      { label: 'Pending KYC', value: workspaceSummary?.pendingKyc ?? data?.pendingKyc ?? '—', icon: FileCheck, color: 'bg-amber-500 text-white' },
      { label: 'Brand Verifications', value: workspaceSummary?.pendingBrandVerifications ?? data?.pendingBrandVerifications ?? '—', icon: Building2, color: 'bg-violet-600 text-white' },
      { label: 'Campaign Flags', value: workspaceSummary?.flaggedCampaigns ?? data?.openCampaignFlags ?? '—', icon: AlertTriangle, color: 'bg-orange-500 text-white' },
      { label: 'Open Appeals', value: data?.openAppeals ?? '—', icon: ClipboardList, color: 'bg-pink-600 text-white' },
      { label: 'GDPR Requests', value: data?.pendingGdprRequests ?? '—', icon: ClipboardList, color: 'bg-cyan-600 text-white' },
      { label: 'Admin DAU', value: data?.adminDailyActiveUsers ?? '—', icon: Activity, color: 'bg-slate-700 text-white' },
      {
        label: 'Admin CSAT',
        value: data?.adminCsatAverage ? data.adminCsatAverage.toFixed(1) : '—',
        icon: Star,
        color: 'bg-amber-500 text-white',
      },
    ]
  }, [data, financeSummary, workspaceSummary])
  const statsPerPage = 4
  const totalStatsPages = Math.max(1, Math.ceil(stats.length / statsPerPage))
  const pagedStats = showAllStats
    ? stats
    : stats.slice(statsPage * statsPerPage, (statsPage + 1) * statsPerPage)
  const canPrevStats = statsPage > 0
  const canNextStats = statsPage < totalStatsPages - 1

  const workQueue = [
    {
      label: 'KYC Review',
      href: '/admin/kyc',
      count: workspaceSummary?.pendingKyc ?? data?.pendingKyc,
      slaBreaches: workspaceSummary?.slaBreaches ?? data?.kycSlaBreaches,
    },
    {
      label: 'Campaign Flags',
      href: '/admin/campaigns',
      count: workspaceSummary?.flaggedCampaigns ?? data?.openCampaignFlags,
    },
    {
      label: 'Disputes',
      href: '/admin/disputes',
      count: workspaceSummary?.openDisputes ?? data?.openDisputes,
      slaBreaches: data?.disputeSlaBreaches,
    },
    {
      label: 'Payout Alerts',
      href: '/admin/finance',
      count: workspaceSummary?.payoutAlerts,
    },
    {
      label: 'GDPR Requests',
      href: '/admin/compliance',
      count: data?.pendingGdprRequests,
      slaBreaches: data?.gdprSlaBreaches,
    },
  ]
  const topActions = actionQueueData?.items ?? workspaceSummary?.topActions ?? []

  const getSlaTone = (breaches?: number) => {
    if (!breaches) return 'bg-slate-100 text-slate-600'
    if (breaches >= 5) return 'bg-rose-600 text-white'
    return 'bg-amber-500 text-white'
  }

  return (
    <div className="space-y-8">
      <DashboardPageShell
        title="Platform Overview"
        subtitle="Operational pulse for queues, risk, and system health."
        eyebrow="Admin Dashboard"
      >

      <div className="ops-hero">
        <div className="relative z-10 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operational Pulse</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Prioritize queues with SLA exposure.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending KYC</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{workspaceSummary?.pendingKyc ?? data?.pendingKyc ?? '—'}</p>
            <p className="text-xs text-slate-500">Verification queue</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">KYC SLA Breaches</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{workspaceSummary?.slaBreaches ?? data?.kycSlaBreaches ?? '—'}</p>
            <p className="text-xs text-slate-500">Immediate attention</p>
          </div>
        </div>
      </div>

      {(isLoading || workspaceLoading) && !data && !workspaceSummary ? (
        <StatCardsSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Key Metrics</p>
              <p className="text-sm text-slate-600">
                Showing {showAllStats ? stats.length : pagedStats.length} of {stats.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-40"
                disabled={!canPrevStats || showAllStats}
                onClick={() => setStatsPage((page) => Math.max(0, page - 1))}
              >
                Prev
              </button>
              <button
                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-40"
                disabled={!canNextStats || showAllStats}
                onClick={() => setStatsPage((page) => Math.min(totalStatsPages - 1, page + 1))}
              >
                Next
              </button>
              <button
                className="h-9 rounded-full border border-slate-200 bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800"
                onClick={() => {
                  setShowAllStats((value) => !value)
                  setStatsPage(0)
                }}
              >
                {showAllStats ? 'Show less' : 'See all'}
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pagedStats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="flex items-center justify-between">
                  <div className={`metric-icon ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    {data ? 'Live' : 'Pending'}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-slate-900">{stat.value ?? '—'}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
                {stat.helper ? <p className="mt-1 text-xs text-slate-400">{stat.helper}</p> : null}
              </div>
            ))}
          </div>
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Summary data is temporarily unavailable. Showing placeholders until the service recovers.
        </div>
      )}

      <div className="section-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Work Queue</h2>
            <p className="text-sm text-slate-500">Prioritized queues with SLA risk.</p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Live</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workQueue.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-xs text-slate-700">
                  {item.count ?? '—'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 ${getSlaTone(item.slaBreaches)}`}>
                  {item.slaBreaches !== undefined ? `${item.slaBreaches} SLA` : 'SLA n/a'}
                </span>
                <span className="text-slate-400">Next action: review</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {topActions.length > 0 && (
        <div className="section-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Next Best Actions</h2>
              <p className="text-sm text-slate-500">Unified queue items ordered by urgency and waiting time.</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {actionQueueData?.total ?? topActions.length} open
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {topActions.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    {item.subtitle ? <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p> : null}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${getSlaTone(item.severity === 'blocked' ? 1 : 0)}`}>
                    {item.dueState}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-600">{item.primaryAction}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="section-card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Review KYC', href: '/admin/kyc', icon: FileCheck },
              { label: 'Verify Brands', href: '/admin/brands', icon: Building2 },
              { label: 'Handle Disputes', href: '/admin/disputes', icon: Scale },
              { label: 'View Audit Log', href: '/admin/audit', icon: ClipboardList },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <action.icon className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Snapshot</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>Pending KYC: <span className="font-semibold text-slate-900">{data?.pendingKyc ?? '—'}</span></p>
            <p>Campaign Flags: <span className="font-semibold text-slate-900">{data?.openCampaignFlags ?? '—'}</span></p>
            <p>GDPR Requests: <span className="font-semibold text-slate-900">{data?.pendingGdprRequests ?? '—'}</span></p>
            <p>Open Appeals: <span className="font-semibold text-slate-900">{data?.openAppeals ?? '—'}</span></p>
            <p>
              Avg KYC Decision:{' '}
              <span className="font-semibold text-slate-900">
                {data?.avgKycDecisionHours !== undefined ? `${data.avgKycDecisionHours.toFixed(1)}h` : '—'}
              </span>
            </p>
            <p>
              Avg Dispute Resolution:{' '}
              <span className="font-semibold text-slate-900">
                {data?.avgDisputeResolutionHours !== undefined ? `${data.avgDisputeResolutionHours.toFixed(1)}h` : '—'}
              </span>
            </p>
            <p>KYC SLA Breaches: <span className="font-semibold text-slate-900">{data?.kycSlaBreaches ?? '—'}</span></p>
            <p>Dispute SLA Breaches: <span className="font-semibold text-slate-900">{data?.disputeSlaBreaches ?? '—'}</span></p>
            <p>Admin DAU: <span className="font-semibold text-slate-900">{data?.adminDailyActiveUsers ?? '—'}</span></p>
            <p>
              Admin CSAT:{' '}
              <span className="font-semibold text-slate-900">
                {data?.adminCsatAverage ? data.adminCsatAverage.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-400"> ({data?.adminCsatResponses ?? 0} responses)</span>
            </p>
          </div>
        </div>
      </div>

      {showFeedback && (
        <div className="section-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Admin CSAT</h2>
              <p className="text-sm text-slate-500">How satisfied are you with the admin tools today?</p>
            </div>
            <button
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => setShowFeedback(false)}
            >
              Dismiss
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`h-10 w-10 rounded-lg border text-sm font-semibold ${
                  csatRating === rating
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
                onClick={() => setCsatRating(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
          <textarea
            className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm"
            rows={3}
            value={csatComment}
            onChange={(event) => setCsatComment(event.target.value)}
            placeholder="Optional feedback to improve the admin experience"
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              disabled={!csatRating}
              onClick={() => {
                if (!csatRating) return
                adminSystemService.submitFeedback(csatRating, csatComment || undefined).then(() => {
                  localStorage.setItem('admin_csat_last', new Date().toISOString())
                  setShowFeedback(false)
                  setCsatRating(null)
                  setCsatComment('')
                })
              }}
            >
              Submit Feedback
            </button>
            <p className="text-xs text-slate-400">Thanks for helping us improve.</p>
          </div>
        </div>
      )}
      </DashboardPageShell>
    </div>
  )
}
