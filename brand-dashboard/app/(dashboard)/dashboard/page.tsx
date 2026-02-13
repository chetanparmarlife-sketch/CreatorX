'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Users, Calendar, IndianRupee, AlertCircle, Wallet } from 'lucide-react'
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
  change: string
  changeType: 'positive' | 'negative'
  color: string
}

interface RecentActivity {
  id: string
  title: string
  description: string
  time: string
  type: 'campaign' | 'influencer' | 'payment'
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

  const recentActivities = useMemo(() => {
    const campaignActivities: RecentActivity[] = campaigns
      .slice(0, 4)
      .map((campaign) => ({
        id: String(campaign.id),
        title: `Campaign ${campaign.status === CampaignStatus.COMPLETED ? 'completed' : 'updated'}`,
        description: campaign.title,
        time: formatRelativeTime(campaign.updatedAt || campaign.createdAt),
        type: 'campaign',
      }))

    const paymentActivities: RecentActivity[] = (transactionsData ?? [])
      .slice(0, 2)
      .map((transaction: Transaction) => ({
        id: String(transaction.id),
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
      label: 'Active Campaigns',
      value: String(activeCampaigns.length),
      change: `${campaigns.length} total`,
      changeType: 'positive',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: Users,
      label: 'Total Creators',
      value: String(creatorsTotal),
      change: creators.length ? `${creators.length} listed` : 'No creators yet',
      changeType: 'positive',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Engagement',
      value: `${averageEngagement}%`,
      change: creators.length ? 'Across listed creators' : 'No data yet',
      changeType: 'positive',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      icon: IndianRupee,
      label: 'Total Spend',
      value: formatCurrency(totalSpend),
      change: transactionsData?.length ? 'Wallet transactions' : 'No transactions yet',
      changeType: 'negative',
      color: 'bg-slate-900 text-slate-100',
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget utilization</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{budgetUtilization}%</p>
                <p className="text-xs text-slate-500">Spend vs total budget</p>
              </div>
              <div className="insight-pill">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active campaigns</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{activeCampaigns.length}</p>
                <p className="text-xs text-slate-500">{campaigns.length} campaigns total</p>
              </div>
              <div className="insight-pill">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Avg engagement</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{averageEngagement}%</p>
                <p className="text-xs text-slate-500">Across listed creators</p>
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
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Campaign mix</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>In review</span>
                  <span className="font-semibold text-slate-900">{reviewCampaigns.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active now</span>
                  <span className="font-semibold text-slate-900">{activeCampaigns.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed</span>
                  <span className="font-semibold text-slate-900">{completedCampaigns.length}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deliverables signal</p>
              <div className="mt-3 flex items-center gap-2">
                <StatusChip tone={deliverableCounts.REVISION_REQUESTED ? 'needs_action' : 'approved'} size="compact">
                  {deliverableCounts.REVISION_REQUESTED ? 'Needs attention' : 'On track'}
                </StatusChip>
                <span className="text-xs text-slate-500">
                  {deliverableCounts.PENDING || 0} pending approvals
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="metric-card">
              <div className="flex items-center justify-between">
                <div className={`metric-icon ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Snapshot</span>
              </div>
              <div className="mt-4 text-sm text-slate-600">{stat.label}</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</div>
              <div
                className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 section-card">
          <ActionBar
            title="Lifecycle progress"
            description="Track campaigns across their stages."
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
                style={{ width: `${budgetUtilization}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Spend vs budget</span>
              <span>{budgetUtilization}% utilized</span>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-slate-900 font-medium mb-1">{activity.title}</h4>
                    <p className="text-sm text-slate-600">{activity.description}</p>
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
            <button
              className="quick-action border-emerald-200/70 bg-emerald-50 text-emerald-900"
              onClick={() => router.push('/campaigns/new')}
            >
              <div className="text-sm font-medium">Create Campaign</div>
            </button>
            <button
              className="quick-action"
              onClick={() => router.push('/creators')}
            >
              <div className="text-sm font-medium">Find Influencers</div>
            </button>
            <button
              className="quick-action"
              onClick={() => router.push('/payments')}
            >
              <div className="text-sm font-medium">Process Payments</div>
            </button>
            <button
              className="quick-action"
              onClick={() => router.push('/campaigns')}
            >
              <div className="text-sm font-medium">View Reports</div>
            </button>
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



