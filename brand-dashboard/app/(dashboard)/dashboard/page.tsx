'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  Users,
  Calendar,
  IndianRupee,
  AlertCircle,
  Wallet,
  Rocket,
  Search,
  CreditCard,
  BarChart3,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { StatCardsSkeleton, Skeleton } from '@/components/shared/skeleton'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useCreators } from '@/lib/hooks/use-creators'
import { useTransactions } from '@/lib/hooks/use-payments'
import { useBrandWallet } from '@/lib/hooks/use-wallet'
import { deliverableService } from '@/lib/api/deliverables'
import { ActionBar } from '@/components/shared/action-bar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { CampaignStatus, Transaction } from '@/lib/types'

interface StatCard {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  helper: string
  changeType: 'positive' | 'negative'
  color: string
  meterPercent: number
  meterTone: string
}

interface RecentActivity {
  id: string
  title: string
  description: string
  time: string
  type: 'campaign' | 'influencer' | 'payment'
}

interface QuickActionItem {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const LOW_BALANCE_THRESHOLD = 5000
const visualPercent = (value: number, minimum = 12) =>
  value > 0 ? Math.max(minimum, Math.min(100, Math.round(value))) : 0

export default function DashboardPage() {
  const router = useRouter()
  const { data: walletData } = useBrandWallet()
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({}, 0)
  const { data: creatorsData, isLoading: creatorsLoading } = useCreators({ page: 0, size: 20 })
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 20,
  })
  const { data: deliverablesData, isLoading: deliverablesLoading } = useQuery({
    queryKey: ['brand-deliverables-summary'],
    queryFn: () => deliverableService.getBrandDeliverables({ page: 0, size: 50 }),
  })

  const campaigns = campaignsData?.items ?? []
  const creatorsResponse = creatorsData as { items?: any[]; total?: number } | any[] | undefined
  const creators = Array.isArray(creatorsResponse)
    ? creatorsResponse
    : creatorsResponse?.items ?? []
  const creatorsTotal =
    (Array.isArray(creatorsResponse) ? creatorsResponse.length : creatorsResponse?.total) ??
    creators.length

  const totalSpend = (transactionsData ?? []).reduce(
    (sum: number, transaction: Transaction) => sum + (transaction.amount ?? 0),
    0
  )
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0)
  const budgetUtilization = totalBudget ? Math.min(100, Math.round((totalSpend / totalBudget) * 100)) : 0

  const averageEngagement = useMemo(() => {
    if (!creators.length) return 0
    const total = creators.reduce((acc, creator: any) => acc + (creator.engagementRate ?? 0), 0)
    return Number((total / creators.length).toFixed(1))
  }, [creators])

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === CampaignStatus.ACTIVE
  )
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.DRAFT)
  const reviewCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.PENDING_REVIEW)
  const completedCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.COMPLETED)

  const deliverables = (deliverablesData as { items?: any[] } | undefined)?.items ?? []
  const deliverableCounts = deliverables.reduce(
    (acc: Record<string, number>, item: any) => {
      const key = item.status || 'PENDING'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {}
  )
  const inProgressTasks = deliverables
    .filter((item: any) => item.status === 'PENDING' || item.status === 'REVISION_REQUESTED')
    .slice(0, 4)
  const pendingApprovals = deliverableCounts.PENDING || 0
  const revisionsRequested = deliverableCounts.REVISION_REQUESTED || 0
  const deliverablesQueue = pendingApprovals + revisionsRequested
  const reviewQueue = draftCampaigns.length + reviewCampaigns.length
  const lifecycleProgress = campaigns.length
    ? Math.round(((activeCampaigns.length + completedCampaigns.length) / campaigns.length) * 100)
    : 0
  const reviewLoadPercent = campaigns.length ? (reviewQueue / campaigns.length) * 100 : 0
  const deliverableLoadPercent = deliverables.length
    ? (deliverablesQueue / deliverables.length) * 100
    : 0
  const creatorCoveragePercent = creatorsTotal ? (creatorsTotal / 24) * 100 : 0
  const engagementHealthPercent = averageEngagement ? (averageEngagement / 6) * 100 : 0

  const priorityItems = [
    { label: 'Review campaigns', value: reviewCampaigns.length, tone: 'bg-amber-500' },
    { label: 'Approve deliverables', value: pendingApprovals, tone: 'bg-blue-500' },
    { label: 'Resolve revisions', value: revisionsRequested, tone: 'bg-rose-500' },
  ]
  const topPriorityValue = Math.max(...priorityItems.map((item) => item.value), 1)
  const totalPriorityItems = priorityItems.reduce((sum, item) => sum + item.value, 0)

  const quickActions: QuickActionItem[] = [
    {
      title: 'Create campaign',
      description: 'Launch a new brief, budget, and creator scope.',
      href: '/campaigns/new',
      icon: Rocket,
      className: 'border-emerald-200/70 bg-emerald-50 text-emerald-900',
    },
    {
      title: 'Find creators',
      description: 'Source vetted creators for your next campaign.',
      href: '/creators',
      icon: Search,
    },
    {
      title: 'Process payments',
      description: 'Fund wallet and release creator payouts.',
      href: '/payments',
      icon: CreditCard,
    },
    {
      title: 'View reports',
      description: 'Check campaign performance and spend health.',
      href: '/campaigns',
      icon: BarChart3,
    },
  ]

  const recentActivities = useMemo(() => {
    const campaignActivities: RecentActivity[] = campaigns
      .slice(0, 4)
      .map((campaign) => ({
        id: `campaign-${campaign.id}`,
        title: `Campaign ${campaign.status === CampaignStatus.COMPLETED ? 'completed' : 'updated'}`,
        description: campaign.title,
        time: formatRelativeTime(campaign.updatedAt || campaign.createdAt),
        type: 'campaign',
      }))

    const paymentActivities: RecentActivity[] = (transactionsData ?? [])
      .slice(0, 2)
      .map((transaction: Transaction) => ({
        id: `payment-${transaction.id}`,
        title: 'Payment processed',
        description: `${formatCurrency(transaction.amount ?? 0)} - ${transaction.description || 'Transaction'}`,
        time: formatRelativeTime(transaction.createdAt),
        type: 'payment',
      }))

    return [...paymentActivities, ...campaignActivities].slice(0, 4)
  }, [campaigns, transactionsData])

  const stats: StatCard[] = [
    {
      icon: Calendar,
      label: 'Campaign Portfolio',
      value: String(campaigns.length),
      helper: `${activeCampaigns.length} live, ${reviewQueue} in queue`,
      changeType: 'positive',
      color: 'bg-blue-100 text-blue-700',
      meterPercent: lifecycleProgress,
      meterTone: 'bg-blue-500',
    },
    {
      icon: Users,
      label: 'Creator Network',
      value: String(creatorsTotal),
      helper: creators.length ? `${averageEngagement}% avg engagement` : 'No creators yet',
      changeType: 'positive',
      color: 'bg-emerald-100 text-emerald-700',
      meterPercent: creatorCoveragePercent,
      meterTone: 'bg-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Deliverables Queue',
      value: String(deliverablesQueue),
      helper: revisionsRequested ? `${revisionsRequested} require revision` : 'No blocked items',
      changeType: revisionsRequested ? 'negative' : 'positive',
      color: 'bg-teal-100 text-teal-700',
      meterPercent: deliverableLoadPercent,
      meterTone: revisionsRequested ? 'bg-rose-500' : 'bg-teal-500',
    },
    {
      icon: IndianRupee,
      label: 'Budget Utilization',
      value: `${budgetUtilization}%`,
      helper: totalBudget
        ? `${formatCurrency(totalSpend)} / ${formatCurrency(totalBudget)}`
        : 'Set campaign budgets to track pacing',
      changeType: budgetUtilization > 80 ? 'negative' : 'positive',
      color: 'bg-slate-900 text-slate-100',
      meterPercent: budgetUtilization,
      meterTone: budgetUtilization > 80 ? 'bg-rose-500' : 'bg-blue-500',
    },
  ]

  const isLoading = campaignsLoading || creatorsLoading || transactionsLoading

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <StatCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 surface-card">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" />

      {walletData && walletData.balance < LOW_BALANCE_THRESHOLD && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-800">
            <span className="font-medium">Low wallet balance:</span>{' '}
            {formatCurrency(walletData.balance)} remaining.{' '}
            <button
              className="underline underline-offset-2 font-medium hover:text-amber-900"
              onClick={() => router.push('/payments')}
            >
              Add funds
            </button>
          </div>
          <Wallet className="h-5 w-5 shrink-0 text-amber-500" />
        </div>
      )}

      <div className="hero-surface">
        <div className="hero-grid">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="hero-chip">Live brand pulse</span>
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Keep every campaign moving with clarity and momentum.
              </h2>
              <p className="text-sm text-slate-600">
                A fast read on spend, creator activity, and deliverables so you can act before
                the week gets busy.
              </p>
            </div>
            <div className="hero-actions">
              <button className="hero-primary" onClick={() => router.push('/campaigns/new')}>
                Launch campaign
              </button>
              <button className="hero-secondary" onClick={() => router.push('/campaigns')}>
                View performance
              </button>
            </div>
            <div className="insight-strip">
              <div className="insight-pill">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget utilization</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{budgetUtilization}%</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      budgetUtilization > 80 ? 'bg-rose-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${visualPercent(budgetUtilization)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Spend vs total budget</p>
              </div>
              <div className="insight-pill">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review queue</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{reviewQueue}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${visualPercent(reviewLoadPercent)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Draft + in review campaigns</p>
              </div>
              <div className="insight-pill">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deliverables queue</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{deliverablesQueue}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      revisionsRequested ? 'bg-rose-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${visualPercent(deliverableLoadPercent)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Awaiting approval or revisions</p>
              </div>
            </div>
          </div>
          <div className="hero-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Wallet health</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(walletData?.balance ?? 0)}
                </p>
              </div>
              <div
                className="relative h-14 w-14 rounded-full p-1"
                style={{
                  background: `conic-gradient(${
                    budgetUtilization > 80
                      ? 'rgba(244, 63, 94, 0.9)'
                      : budgetUtilization > 55
                        ? 'rgba(245, 158, 11, 0.9)'
                        : 'rgba(37, 99, 235, 0.9)'
                  } ${budgetUtilization}%, rgba(226, 232, 240, 0.95) ${budgetUtilization}% 100%)`,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Immediate priorities</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                {priorityItems.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.tone}`}
                        style={{
                          width: `${visualPercent((item.value / topPriorityValue) * 100, 18)}%`,
                          opacity: item.value === 0 ? 0.35 : 1,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <StatusChip tone={totalPriorityItems > 0 ? 'needs_action' : 'approved'} size="compact">
                  {totalPriorityItems > 0 ? `${totalPriorityItems} items need follow-up` : 'No urgent blockers'}
                </StatusChip>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Creator momentum</p>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Listed creators</span>
                    <span className="font-semibold text-slate-900">{creatorsTotal}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${visualPercent(creatorCoveragePercent)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Average engagement</span>
                    <span className="font-semibold text-slate-900">{averageEngagement}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        averageEngagement >= 3 ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${visualPercent(engagementHealthPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <StatusChip tone={averageEngagement >= 3 ? 'approved' : 'pending'} size="compact">
                  {averageEngagement >= 3 ? 'Healthy creator mix' : 'Expand creator shortlist'}
                </StatusChip>
                <span className="text-xs text-slate-500">
                  {creatorsTotal ? 'Keep refreshing top performers weekly.' : 'Shortlist your first creator batch.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="metric-card">
              <div className="flex items-center justify-between">
                <div className={`metric-icon ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Snapshot</span>
              </div>
              <div className="mt-4 text-sm text-slate-600">{stat.label}</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${stat.meterTone}`}
                  style={{ width: `${visualPercent(stat.meterPercent)}%` }}
                />
              </div>
              <div
                className={`mt-2 text-xs ${
                  stat.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stat.helper}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 section-card">
          <ActionBar
            title="Lifecycle progress"
            description="Track how quickly campaigns move from planning to completion."
          >
            <button
              className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-amber-200/80"
              onClick={() => router.push('/campaigns')}
            >
              View campaigns
            </button>
          </ActionBar>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <ContextPanel title="Draft" description={String(draftCampaigns.length)} />
            <ContextPanel title="In Review" description={String(reviewCampaigns.length)} />
            <ContextPanel title="Active" description={String(activeCampaigns.length)} />
            <ContextPanel title="Completed" description={String(completedCampaigns.length)} />
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${lifecycleProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Live + completed campaigns</span>
              <span>{lifecycleProgress}% of portfolio</span>
            </div>
          </div>
        </div>
        <div className="section-card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Spend & budget health</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total budget</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total spend</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalSpend)}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip tone={budgetUtilization > 80 ? 'needs_action' : 'approved'} size="compact">
                {budgetUtilization > 80 ? 'Near budget cap' : 'On track'}
              </StatusChip>
              <span className="text-xs text-slate-500">Monitor pacing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 section-card p-0">
          <div className="p-6 border-b border-slate-200/70">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No recent activity yet.</div>
            ) : (
              recentActivities.map((activity) => (
              <div key={activity.id} className="activity-row p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        activity.type === 'payment'
                          ? 'bg-emerald-100 text-emerald-700'
                          : activity.type === 'campaign'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {activity.type === 'payment' ? (
                        <IndianRupee className="h-4 w-4" />
                      ) : activity.type === 'campaign' ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-medium text-slate-900">{activity.title}</h4>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="section-card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.title}
                  className={`quick-action ${action.className ?? ''}`}
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{action.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Deliverables status</h3>
          {deliverablesLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
              <ContextPanel title="Pending" description={String(deliverableCounts.PENDING || 0)} />
              <ContextPanel title="Approved" description={String(deliverableCounts.APPROVED || 0)} />
              <ContextPanel title="Needs revision" description={String(deliverableCounts.REVISION_REQUESTED || 0)} />
              <ContextPanel title="Rejected" description={String(deliverableCounts.REJECTED || 0)} />
            </div>
          )}
        </div>
        <div className="section-card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">In-progress creator tasks</h3>
          {deliverablesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : inProgressTasks.length === 0 ? (
            <EmptyState
              title="No active creator tasks"
              description="Pending deliverables will show up here."
            />
          ) : (
            <div className="space-y-3">
              {inProgressTasks.map((task: any) => (
                <div key={task.id} className="task-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      {task.campaignTitle || 'Campaign'} - {task.creatorName || 'Creator'}
                    </p>
                    <StatusChip tone="needs_action" size="compact">
                      {task.status || 'PENDING'}
                    </StatusChip>
                  </div>
                  <p className="text-xs text-slate-500">{task.campaignDeliverable?.title || 'Deliverable'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



