'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { analyticsService, AnalyticsRange } from '@/lib/api/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type AnalyticsResponse = {
  totalApplications?: number
  totalSelected?: number
  totalShortlisted?: number
  totalRejected?: number
  applicationStatusBreakdown?: Record<string, number>
  deliverableStatusBreakdown?: Record<string, number>
  applicationsOverTime?: Array<{ date: string; count: number }>
  engagementMetrics?: {
    averageEngagementRate?: number
    totalFollowers?: number
    activeCreators?: number
    averageResponseTime?: number
  }
}

const rangeOptions: { label: string; value: AnalyticsRange }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'All time', value: 'all' },
]

const statusColors: Record<string, string> = {
  APPLIED: '#A3A3A3',
  SHORTLISTED: '#F59E0B',
  SELECTED: '#10B981',
  REJECTED: '#EF4444',
}

const deliverableColors: Record<string, string> = {
  PENDING: '#94A3B8',
  APPROVED: '#10B981',
  REVISION_REQUESTED: '#F59E0B',
  REJECTED: '#EF4444',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)

export default function CampaignAnalyticsPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const [range, setRange] = useState<AnalyticsRange>('30d')

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-analytics', campaignId, range],
    queryFn: () => analyticsService.getCampaignAnalytics(campaignId, range),
    enabled: !!campaignId,
  })

  const analytics = (data as AnalyticsResponse) || {}

  const statusDistribution = Object.entries(analytics.applicationStatusBreakdown ?? {}).map(
    ([status, count]) => ({ status, count })
  )
  const deliverableDistribution = Object.entries(analytics.deliverableStatusBreakdown ?? {}).map(
    ([status, count]) => ({ status, count })
  )
  const applicationsOverTime = analytics.applicationsOverTime ?? []
  const engagement = analytics.engagementMetrics ?? {}

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Applications', String(analytics.totalApplications ?? 0)],
      ['Selected Creators', String(analytics.totalSelected ?? 0)],
      ['Shortlisted Creators', String(analytics.totalShortlisted ?? 0)],
      ['Rejected Applications', String(analytics.totalRejected ?? 0)],
      ['Average Engagement Rate', `${engagement.averageEngagementRate ?? 0}%`],
      ['Total Followers', String(engagement.totalFollowers ?? 0)],
      ['Active Creators', String(engagement.activeCreators ?? 0)],
      ['Average Response Time (hrs)', String(engagement.averageResponseTime ?? 0)],
    ]

    const csvContent = rows.map((row) => row.map((value) => `"${value}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campaign-${campaignId}-analytics.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const metricCards = useMemo(() => {
    return [
      {
        title: 'Total Applications',
        value: analytics.totalApplications ?? 0,
      },
      {
        title: 'Selected Creators',
        value: analytics.totalSelected ?? 0,
      },
      {
        title: 'Shortlisted Creators',
        value: analytics.totalShortlisted ?? 0,
      },
      {
        title: 'Avg. Engagement Rate',
        value: `${engagement.averageEngagementRate ?? 0}%`,
      },
    ]
  }, [analytics, engagement.averageEngagementRate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Campaign performance overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={range === option.value ? 'default' : 'outline'}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load analytics. Please try again.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900">{card.value}</div>
                  {card.helper && (
                    <p className="mt-1 text-xs text-emerald-600">{card.helper}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="count" nameKey="status" outerRadius={90}>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={statusColors[entry.status] || '#A3A3A3'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Deliverable Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deliverableDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count">
                      {deliverableDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={deliverableColors[entry.status] || '#94A3B8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Creator Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Average Engagement Rate</span>
                  <span className="font-medium">{engagement.averageEngagementRate ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Followers</span>
                  <span className="font-medium">{formatNumber(engagement.totalFollowers ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Creators</span>
                  <span className="font-medium">{engagement.activeCreators ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg. Response Time</span>
                  <span className="font-medium">
                    {engagement.averageResponseTime ?? 0} hrs
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
