'use client'

import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

interface StatCard {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  color: string
}

const stats: StatCard[] = [
  {
    icon: Calendar,
    label: 'Active Campaigns',
    value: '12',
    change: '+2 from last month',
    changeType: 'positive',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Users,
    label: 'Total Influencers',
    value: '89',
    change: '+15 from last month',
    changeType: 'positive',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    icon: TrendingUp,
    label: 'Avg. Engagement',
    value: '4.8%',
    change: '+0.5% from last month',
    changeType: 'positive',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: DollarSign,
    label: 'Total Spend',
    value: '$24,580',
    change: '-$1,200 from last month',
    changeType: 'negative',
    color: 'bg-orange-100 text-orange-700',
  },
]

interface RecentActivity {
  id: number
  title: string
  description: string
  time: string
  type: 'campaign' | 'influencer' | 'payment'
}

const recentActivities: RecentActivity[] = [
  {
    id: 1,
    title: 'New campaign created',
    description: 'Summer Collection Launch campaign has been created',
    time: '2 hours ago',
    type: 'campaign',
  },
  {
    id: 2,
    title: 'Influencer added',
    description: 'Sarah Johnson added to Fashion Influencers list',
    time: '5 hours ago',
    type: 'influencer',
  },
  {
    id: 3,
    title: 'Payment processed',
    description: '$2,500 payment sent to 5 influencers',
    time: '1 day ago',
    type: 'payment',
  },
  {
    id: 4,
    title: 'Campaign completed',
    description: 'Holiday Special 2024 campaign has ended',
    time: '2 days ago',
    type: 'campaign',
  },
]

export default function DashboardPage() {
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
            {recentActivities.map((activity) => (
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors">
              <div className="text-sm font-medium">Create Campaign</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium">Find Influencers</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium">Process Payments</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium">View Reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
