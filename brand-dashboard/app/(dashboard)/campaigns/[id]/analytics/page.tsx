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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type AnalyticsResponse = {
  metrics?: {
    totalApplications?: number
    applicationsTrend?: number
    selectedCreators?: number
    deliverablesSubmitted?: number
    deliverablesTotal?: number
    budgetSpent?: number
    budgetTotal?: number
  }
  applicationsOverTime?: Array<{ date: string; count: number }>
  applicationStatusDistribution?: Array<{ status: string; count: number }>
  deliverableStatus?: Array<{ status: string; count: number }>
  creatorEngagement?: Array<{
    creator: string
    applications: number
    deliverables: number
    completionRate: number
  }>
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

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

  const statusDistribution = analytics.applicationStatusDistribution ?? []
  const deliverableDistribution = analytics.deliverableStatus ?? []
  const applicationsOverTime = analytics.applicationsOverTime ?? []
  const creatorEngagement = analytics.creatorEngagement ?? []

  const exportCsv = () => {
    const rows = [
      ['Creator', 'Applications', 'Deliverables', 'Completion Rate'],
      ...creatorEngagement.map((row) => [
        row.creator,
        String(row.applications ?? 0),
        String(row.deliverables ?? 0),
        `${row.completionRate ?? 0}%`,
      ]),
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
    const metrics = analytics.metrics ?? {}
    const applicationsTrend = metrics.applicationsTrend ?? 0
    const trendLabel = `${applicationsTrend > 0 ? '+' : ''}${applicationsTrend}%`

    return [
      {
        title: 'Total Applications',
        value: metrics.totalApplications ?? 0,
        helper: trendLabel,
      },
      {
        title: 'Selected Creators',
        value: metrics.selectedCreators ?? 0,
      },
      {
        title: 'Deliverables Submitted',
        value: `${metrics.deliverablesSubmitted ?? 0}/${metrics.deliverablesTotal ?? 0}`,
      },
      {
        title: 'Budget Spent',
        value: `${formatCurrency(metrics.budgetSpent ?? 0)} / ${formatCurrency(
          metrics.budgetTotal ?? 0
        )}`,
      },
    ]
  }, [analytics.metrics])

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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Deliverables</TableHead>
                      <TableHead>Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creatorEngagement.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500">
                          No creator engagement data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      creatorEngagement.map((row) => (
                        <TableRow key={row.creator}>
                          <TableCell className="font-medium text-slate-900">{row.creator}</TableCell>
                          <TableCell>{row.applications ?? 0}</TableCell>
                          <TableCell>{row.deliverables ?? 0}</TableCell>
                          <TableCell>{row.completionRate ?? 0}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
