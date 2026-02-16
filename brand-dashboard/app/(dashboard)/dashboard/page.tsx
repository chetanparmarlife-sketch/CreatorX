'use client'

import { useEffect, useMemo, useRef } from 'react'
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
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'

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
  id: string
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

interface PriorityItem {
  id: string
  label: string
  value: number
  tone: string
  severity: 'blocked' | 'needs_action' | 'on_track'
  ctaLabel: string
  href: string
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
  const creatorCoveragePercent = creatorsTotal ? (creatorsTotal / 24) * 100 : 0

  const approvedDeliverables = deliverableCounts.APPROVED || 0
  const reviewResolutionPercent = deliverables.length
    ? Math.round((approvedDeliverables / deliverables.length) * 100)
    : 0

  const priorityItems: PriorityItem[] = [
    {
      id: 'review_campaigns',
      label: 'Review campaigns',
      value: reviewCampaigns.length,
      tone: 'bg-amber-500',
      severity: reviewCampaigns.length > 0 ? 'needs_action' : 'on_track',
      ctaLabel: reviewCampaigns.length > 0 ? 'Review now' : 'Open campaigns',
      href: '/campaigns',
    },
    {
      id: 'approve_deliverables',
      label: 'Approve deliverables',
      value: pendingApprovals,
      tone: 'bg-blue-500',
      severity: pendingApprovals > 0 ? 'needs_action' : 'on_track',
      ctaLabel: pendingApprovals > 0 ? 'Approve now' : 'Open queue',
      href: '/deliverables',
    },
    {
      id: 'resolve_revisions',
      label: 'Resolve revisions',
      value: revisionsRequested,
      tone: 'bg-rose-500',
      severity: revisionsRequested > 0 ? 'blocked' : 'on_track',
      ctaLabel: revisionsRequested > 0 ? 'Resolve now' : 'View queue',
      href: '/deliverables',
    },
  ]
  const topPriorityValue = Math.max(...priorityItems.map((item) => item.value), 1)
  const totalPriorityItems = priorityItems.reduce((sum, item) => sum + item.value, 0)
  const portfolioHealthTone =
    totalPriorityItems > 0 || budgetUtilization > 85 ? 'needs_action' : 'approved'

  const { track } = useBrandEventTracker({
    pendingDeliverablesCount: pendingApprovals,
    walletBalance: walletData?.balance ?? null,
  })
  const hasTrackedDashboardView = useRef(false)

  const quickActions: QuickActionItem[] = [
    {
      id: 'create_campaign',
      title: 'Create campaign',
      description: 'Launch a new brief, budget, and creator scope.',
      href: '/campaigns/new?source=dashboard',
      icon: Rocket,
      className: 'border-emerald-200/70 bg-emerald-50 text-emerald-900',
    },
    {
      id: 'find_creators',
      title: 'Find creators',
      description: 'Source vetted creators for your next campaign.',
      href: '/creators',
      icon: Search,
    },
    {
      id: 'process_payments',
      title: 'Process payments',
      description: 'Fund wallet and release creator payouts.',
      href: '/payments',
      icon: CreditCard,
    },
    {
      id: 'view_reports',
      title: 'View reports',
      description: 'Check campaign performance and spend health.',
      href: '/campaigns',
      icon: BarChart3,
    },
  ]

  useEffect(() => {
    if (hasTrackedDashboardView.current) return
    hasTrackedDashboardView.current = true

    track('dashboard_viewed', {
      total_campaigns: campaigns.length,
      active_campaigns: activeCampaigns.length,
      review_queue: reviewQueue,
      deliverables_queue: deliverablesQueue,
      wallet_balance: walletData?.balance ?? null,
    })
  }, [
    activeCampaigns.length,
    campaigns.length,
    deliverablesQueue,
    reviewQueue,
    track,
    walletData?.balance,
  ])

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
      label: 'Review Throughput',
      value: `${reviewResolutionPercent}%`,
      helper: `${approvedDeliverables} approved deliverables`,
      changeType: reviewResolutionPercent >= 50 ? 'positive' : 'negative',
      color: 'bg-teal-100 text-teal-700',
      meterPercent: reviewResolutionPercent,
      meterTone: reviewResolutionPercent >= 50 ? 'bg-teal-500' : 'bg-rose-500',
    },
    {
      icon: Calendar,
      label: 'Completion Pace',
      value: `${lifecycleProgress}%`,
      helper: `${completedCampaigns.length} campaigns completed`,
      changeType: lifecycleProgress >= 50 ? 'positive' : 'negative',
      color: 'bg-slate-900 text-slate-100',
      meterPercent: lifecycleProgress,
      meterTone: lifecycleProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500',
    },
  ]

  const isLoading = campaignsLoading || creatorsLoading || transactionsLoading

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          subtitle="Monitor campaign health, spend, and delivery momentum in one view."
        />
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
      <PageHeader
        title="Dashboard"
        subtitle="Monitor campaign health, spend, and delivery momentum in one view."
      />

      {walletData && walletData.balance < LOW_BALANCE_THRESHOLD && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-800">
            <span className="font-medium">Low wallet balance:</span>{' '}
            {formatCurrency(walletData.balance)} remaining.{' '}
            <button
              className="underline underline-offset-2 font-medium hover:text-amber-900"
              onClick={() => {
                track('priority_card_clicked', {
                  priority_id: 'low_wallet_balance',
                  priority_label: 'Low wallet balance',
                  severity: 'blocked',
                  destination: '/payments',
                })
                router.push('/payments')
              }}
            >
              Add funds
            </button>
          </div>
          <Wallet className="h-5 w-5 shrink-0 text-amber-500" />
        </div>
      )}

      <div className="hero-surface">
        <div className="hero-grid">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="hero-chip">Live brand pulse</span>
              <h2 className="max-w-xl text-xl font-semibold leading-tight text-slate-900 md:text-2xl">
                Focus only on what needs action today.
              </h2>
              <p className="text-sm text-slate-600">
                Priority queue, wallet status, and campaign health in one compact control panel.
              </p>
            </div>

            <div className="hero-actions">
              <button
                className="hero-primary"
                onClick={() => {
                  track('quick_action_clicked', {
                    action_id: 'launch_campaign_hero',
                    action_title: 'Launch campaign',
                    destination: '/campaigns/new?source=dashboard',
                  })
                  router.push('/campaigns/new?source=dashboard')
                }}
              >
                Launch campaign
              </button>
              <button
                className="hero-secondary"
                onClick={() => {
                  track('quick_action_clicked', {
                    action_id: 'view_performance_hero',
                    action_title: 'View performance',
                    destination: '/campaigns',
                  })
                  router.push('/campaigns')
                }}
              >
                View performance
              </button>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white/90 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority queue</p>
                <StatusChip
                  tone={totalPriorityItems > 0 ? 'needs_action' : 'approved'}
                  size="compact"
                >
                  {totalPriorityItems > 0 ? `${totalPriorityItems} open` : 'All clear'}
                </StatusChip>
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                {priorityItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200/70 bg-white p-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{item.label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {item.value > 0 ? `${item.value} pending` : 'No pending items'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-900">{item.value}</span>
                        <button
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
                          onClick={() => {
                            track('priority_card_clicked', {
                              priority_id: item.id,
                              priority_label: item.label,
                              severity: item.severity,
                              pending_items: item.value,
                              destination: item.href,
                            })
                            router.push(item.href)
                          }}
                        >
                          {item.ctaLabel}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
            </div>
          </div>

          <div className="hero-panel space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Portfolio health</p>
                <p className="mt-1 text-sm text-slate-600">
                  Campaign execution, budget pacing, and liquidity readiness.
                </p>
              </div>
              <StatusChip tone={portfolioHealthTone} size="compact">
                {portfolioHealthTone === 'approved' ? 'On track' : 'Needs attention'}
              </StatusChip>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200/70 bg-white p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Live campaigns</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{activeCampaigns.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Wallet</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {formatCurrency(walletData?.balance ?? 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Budget used</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{budgetUtilization}%</p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Avg engagement</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{averageEngagement}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white p-3 text-sm">
              <span className="text-slate-600">Funding readiness</span>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
                onClick={() => {
                  track('priority_card_clicked', {
                    priority_id: 'funding_readiness',
                    priority_label: 'Funding readiness',
                    severity: walletData && walletData.balance < LOW_BALANCE_THRESHOLD ? 'blocked' : 'on_track',
                    destination: '/payments',
                  })
                  router.push('/payments')
                }}
              >
                {walletData && walletData.balance < LOW_BALANCE_THRESHOLD ? 'Fund wallet' : 'View wallet'}
              </button>
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
              onClick={() => {
                track('quick_action_clicked', {
                  action_id: 'view_campaigns_lifecycle',
                  action_title: 'View campaigns',
                  destination: '/campaigns',
                })
                router.push('/campaigns')
              }}
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
                  onClick={() => {
                    track('quick_action_clicked', {
                      action_id: action.id,
                      action_title: action.title,
                      destination: action.href,
                    })
                    router.push(action.href)
                  }}
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
