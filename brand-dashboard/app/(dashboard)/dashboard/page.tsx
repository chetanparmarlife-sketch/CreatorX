'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Wallet,
  Rocket,
  Search,
  CreditCard,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/skeleton'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useCreators } from '@/lib/hooks/use-creators'
import { useBrandWallet } from '@/lib/hooks/use-wallet'
import { deliverableService } from '@/lib/api/deliverables'
import { ActionBar } from '@/components/shared/action-bar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { CampaignStatus } from '@/lib/types'
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'

type PriorityItem = {
  id: string
  label: string
  value: number
  severity: 'blocked' | 'needs_action' | 'on_track'
  ctaLabel: string
  href: string
}

type QuickActionItem = {
  id: string
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const LOW_BALANCE_THRESHOLD = 5000

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function DashboardPage() {
  const router = useRouter()
  const { data: walletData } = useBrandWallet()
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({}, 0)
  const { data: creatorsData, isLoading: creatorsLoading } = useCreators({ page: 0, size: 20 })
  const { data: deliverablesData, isLoading: deliverablesLoading } = useQuery({
    queryKey: ['brand-deliverables-summary'],
    queryFn: () => deliverableService.getBrandDeliverables({ page: 0, size: 20 }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  })

  const campaigns = campaignsData?.items ?? []
  const creatorsResponse = creatorsData as { items?: any[]; total?: number } | any[] | undefined
  const creators = Array.isArray(creatorsResponse)
    ? creatorsResponse
    : creatorsResponse?.items ?? []
  const creatorsTotal =
    (Array.isArray(creatorsResponse) ? creatorsResponse.length : creatorsResponse?.total) ??
    creators.length

  const totalSpend = walletData?.totalAllocated ?? 0
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0)
  const budgetUtilization = totalBudget
    ? Math.min(100, Math.round((totalSpend / totalBudget) * 100))
    : 0

  const averageEngagement = useMemo(() => {
    if (!creators.length) return 0
    const total = creators.reduce((acc, creator: any) => acc + (creator.engagementRate ?? 0), 0)
    return Number((total / creators.length).toFixed(1))
  }, [creators])

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.ACTIVE)
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.DRAFT)
  const reviewCampaigns = campaigns.filter(
    (campaign) => campaign.status === CampaignStatus.PENDING_REVIEW
  )
  const completedCampaigns = campaigns.filter(
    (campaign) => campaign.status === CampaignStatus.COMPLETED
  )

  const deliverables = (deliverablesData as { items?: any[] } | undefined)?.items ?? []
  const deliverableCounts = deliverables.reduce(
    (acc: Record<string, number>, item: any) => {
      const key = item.status || 'PENDING'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {}
  )

  const pendingApprovals = deliverableCounts.PENDING || 0
  const revisionsRequested = deliverableCounts.REVISION_REQUESTED || 0
  const deliverablesQueue = pendingApprovals + revisionsRequested
  const reviewQueue = draftCampaigns.length + reviewCampaigns.length
  const lifecycleProgress = campaigns.length
    ? Math.round(((activeCampaigns.length + completedCampaigns.length) / campaigns.length) * 100)
    : 0

  const inProgressTasks = deliverables
    .filter((item: any) => item.status === 'PENDING' || item.status === 'REVISION_REQUESTED')
    .slice(0, 5)

  const priorityItems: PriorityItem[] = [
    {
      id: 'review_campaigns',
      label: 'Campaigns waiting review',
      value: reviewCampaigns.length,
      severity: reviewCampaigns.length > 0 ? 'needs_action' : 'on_track',
      ctaLabel: 'Review',
      href: '/campaigns',
    },
    {
      id: 'approve_deliverables',
      label: 'Deliverables waiting approval',
      value: pendingApprovals,
      severity: pendingApprovals > 0 ? 'needs_action' : 'on_track',
      ctaLabel: 'Approve',
      href: '/deliverables',
    },
    {
      id: 'resolve_revisions',
      label: 'Revision requests open',
      value: revisionsRequested,
      severity: revisionsRequested > 0 ? 'blocked' : 'on_track',
      ctaLabel: 'Resolve',
      href: '/deliverables',
    },
  ]

  const quickActions: QuickActionItem[] = [
    {
      id: 'create_campaign',
      title: 'Create campaign',
      description: 'Launch a new brief.',
      href: '/campaigns/new?source=dashboard',
      icon: Rocket,
    },
    {
      id: 'review_deliverables',
      title: 'Review deliverables',
      description: 'Clear creator queue.',
      href: '/deliverables',
      icon: TrendingUp,
    },
    {
      id: 'payments',
      title: 'Manage payments',
      description: 'Fund wallet and payouts.',
      href: '/payments',
      icon: CreditCard,
    },
    {
      id: 'find_creators',
      title: 'Find creators',
      description: 'Expand creator shortlist.',
      href: '/creators',
      icon: Search,
    },
    {
      id: 'view_reports',
      title: 'View reports',
      description: 'Open campaign performance.',
      href: '/campaigns',
      icon: BarChart3,
    },
  ]

  const totalPriorityItems = priorityItems.reduce((sum, item) => sum + item.value, 0)

  const { track } = useBrandEventTracker({
    pendingDeliverablesCount: pendingApprovals,
    walletBalance: walletData?.balance ?? null,
  })
  const hasTrackedDashboardView = useRef(false)

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
  const priorityLoading = campaignsLoading || deliverablesLoading
  const healthLoading = campaignsLoading
  const lifecycleLoading = campaignsLoading
  const tasksLoading = deliverablesLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Operational summary with the next best actions."
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="section-card space-y-4">
          <ActionBar
            title="Priority queue"
            description="Handle these items first to keep campaigns moving."
          >
            <StatusChip tone={totalPriorityItems > 0 ? 'needs_action' : 'approved'} size="compact">
              {totalPriorityItems > 0 ? `${totalPriorityItems} open` : 'All clear'}
            </StatusChip>
          </ActionBar>

          {priorityLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {priorityItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.value} pending</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip
                      tone={
                        item.severity === 'blocked'
                          ? 'blocked'
                          : item.severity === 'needs_action'
                          ? 'needs_action'
                          : 'approved'
                      }
                      size="compact"
                    >
                      {item.value}
                    </StatusChip>
                    <button
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
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
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">Quick actions</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    className="quick-action"
                    onClick={() => {
                      track('quick_action_clicked', {
                        action_id: action.id,
                        action_title: action.title,
                        destination: action.href,
                      })
                      router.push(action.href)
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{action.title}</div>
                        <div className="text-xs text-slate-500">{action.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="section-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Portfolio health</p>
            <StatusChip tone={budgetUtilization > 85 ? 'needs_action' : 'approved'} size="compact">
              {budgetUtilization > 85 ? 'Watch spend' : 'Healthy'}
            </StatusChip>
          </div>

          {healthLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <ContextPanel title="Active campaigns" description={String(activeCampaigns.length)} />
              <ContextPanel title="Review queue" description={String(reviewQueue)} />
              <ContextPanel title="Deliverables queue" description={String(deliverablesQueue)} />

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Budget utilization</span>
                  <span className="font-semibold text-slate-900">{budgetUtilization}%</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Creator engagement</span>
                  <span className="font-semibold text-slate-900">
                    {creatorsLoading ? '--' : `${averageEngagement}%`}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total creators</span>
                  <span className="font-semibold text-slate-900">
                    {creatorsLoading ? '--' : creatorsTotal}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Wallet balance</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(walletData?.balance ?? 0)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="section-card">
          <ActionBar
            title="Lifecycle progress"
            description="How fast campaigns move from setup to completion."
          >
            <button
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
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

          {lifecycleLoading ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <ContextPanel title="Draft" description={String(draftCampaigns.length)} />
                <ContextPanel title="In Review" description={String(reviewCampaigns.length)} />
                <ContextPanel title="Active" description={String(activeCampaigns.length)} />
                <ContextPanel title="Completed" description={String(completedCampaigns.length)} />
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${lifecycleProgress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Completion ratio</span>
                  <span>{lifecycleProgress}%</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total budget</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-slate-600">Total spend</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalSpend)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="section-card">
          <ActionBar
            title="In-progress tasks"
            description="Creator deliverables that need action now."
          />

          {tasksLoading ? (
            <div className="mt-3 space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : inProgressTasks.length === 0 ? (
            <EmptyState
              title="No active tasks"
              description="Pending deliverables will appear here."
            />
          ) : (
            <div className="mt-3 space-y-2.5">
              {inProgressTasks.map((task: any) => (
                <div key={task.id} className="task-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {task.campaignTitle || 'Campaign'}
                    </p>
                    <StatusChip tone="needs_action" size="compact">
                      {task.status || 'PENDING'}
                    </StatusChip>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {task.creatorName || 'Creator'} | {task.campaignDeliverable?.title || 'Deliverable'}
                  </p>
                </div>
              ))}

              <button
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
                onClick={() => {
                  track('quick_action_clicked', {
                    action_id: 'open_deliverables_tasks',
                    action_title: 'Open deliverables',
                    destination: '/deliverables',
                  })
                  router.push('/deliverables')
                }}
              >
                Open deliverables queue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
