'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCardsSkeleton, Skeleton } from '@/components/shared/skeleton'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useCreators } from '@/lib/hooks/use-creators'
import { useTransactions } from '@/lib/hooks/use-payments'
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

export default function DashboardPage() {
  const router = useRouter()
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({}, 0)
  const { data: creatorsData, isLoading: creatorsLoading } = useCreators({ page: 0, size: 20 })
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 20,
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

  const averageEngagement = useMemo(() => {
    if (!creators.length) return 0
    const total = creators.reduce((acc, creator: any) => acc + (creator.engagementRate ?? 0), 0)
    return Number((total / creators.length).toFixed(1))
  }, [creators])

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === CampaignStatus.ACTIVE
  )

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
        description: `${formatCurrency(transaction.amount ?? 0)} • ${transaction.description || 'Transaction'}`,
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
      color: 'bg-sky-100 text-sky-700',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Engagement',
      value: `${averageEngagement}%`,
      change: creators.length ? 'Across listed creators' : 'No data yet',
      changeType: 'positive',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: DollarSign,
      label: 'Total Spend',
      value: formatCurrency(totalSpend),
      change: transactionsData?.length ? 'Wallet transactions' : 'No transactions yet',
      changeType: 'negative',
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  const isLoading = campaignsLoading || creatorsLoading || transactionsLoading

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <StatCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-1 text-gray-600 text-sm">{stat.label}</div>
              <div className="mb-2 text-gray-900 text-2xl font-semibold">{stat.value}</div>
              <div
                className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No recent activity yet.</div>
            ) : (
              recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-medium mb-1">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              className="w-full text-left px-4 py-3 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors"
              onClick={() => router.push('/campaigns/new')}
            >
              <div className="text-sm font-medium">Create Campaign</div>
            </button>
            <button
              className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/creators')}
            >
              <div className="text-sm font-medium">Find Influencers</div>
            </button>
            <button
              className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/payments')}
            >
              <div className="text-sm font-medium">Process Payments</div>
            </button>
            <button
              className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/campaigns')}
            >
              <div className="text-sm font-medium">View Reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
