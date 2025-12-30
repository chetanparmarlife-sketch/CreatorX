import { TrendingUp, MessageSquare, Clock, Users, CheckCircle } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface AnalyticCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  color: string;
}

const analytics: AnalyticCard[] = [
  {
    icon: MessageSquare,
    label: 'Total Messages',
    value: '1,247',
    change: '+12% from last week',
    changeType: 'positive',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Users,
    label: 'Active Conversations',
    value: '23',
    change: '+3 from last week',
    changeType: 'positive',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Clock,
    label: 'Avg Response Time',
    value: '2.4h',
    change: '-15min from last week',
    changeType: 'positive',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: CheckCircle,
    label: 'Response Rate',
    value: '94%',
    change: '+2% from last week',
    changeType: 'positive',
    color: 'bg-orange-100 text-orange-700',
  },
];

interface CampaignStat {
  campaign: string;
  messages: number;
  influencers: number;
  responseRate: string;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
}

const campaignStats: CampaignStat[] = [
  {
    campaign: 'Summer Collection Launch',
    messages: 342,
    influencers: 8,
    responseRate: '96%',
    status: 'ACTIVE',
  },
  {
    campaign: 'Tech Product Review Series',
    messages: 256,
    influencers: 5,
    responseRate: '92%',
    status: 'ACTIVE',
  },
  {
    campaign: 'Food & Recipe Campaign',
    messages: 189,
    influencers: 6,
    responseRate: '88%',
    status: 'ACTIVE',
  },
  {
    campaign: 'Fitness Challenge 2024',
    messages: 124,
    influencers: 4,
    responseRate: '100%',
    status: 'PENDING',
  },
  {
    campaign: 'Beauty Collab Series',
    messages: 98,
    influencers: 3,
    responseRate: '85%',
    status: 'CLOSED',
  },
];

interface TopInfluencer {
  name: string;
  avatar: string;
  messages: number;
  responseRate: string;
  avgResponseTime: string;
}

const topInfluencers: TopInfluencer[] = [
  {
    name: 'Sarah Johnson',
    avatar: 'SJ',
    messages: 156,
    responseRate: '98%',
    avgResponseTime: '1.2h',
  },
  {
    name: 'Michael Chen',
    avatar: 'MC',
    messages: 142,
    responseRate: '95%',
    avgResponseTime: '2.5h',
  },
  {
    name: 'Emma Davis',
    avatar: 'ED',
    messages: 128,
    responseRate: '92%',
    avgResponseTime: '3.1h',
  },
  {
    name: 'Alex Rivera',
    avatar: 'AR',
    messages: 98,
    responseRate: '100%',
    avgResponseTime: '45min',
  },
  {
    name: 'Jessica Lee',
    avatar: 'JL',
    messages: 87,
    responseRate: '89%',
    avgResponseTime: '4.2h',
  },
];

export function MessageAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Message Analytics" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analytics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mb-1 text-gray-600 text-sm">{stat.label}</div>
              <div className="mb-2 text-gray-900 text-2xl">{stat.value}</div>
              <div
                className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-900">Campaign Message Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Messages</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Influencers</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Response Rate</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaignStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{stat.campaign}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{stat.messages}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{stat.influencers}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: stat.responseRate }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">{stat.responseRate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          stat.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : stat.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {stat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Influencers */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-900">Most Active Influencers</h3>
          </div>
          <div className="p-6 space-y-4">
            {topInfluencers.map((influencer, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-sm">{influencer.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm text-gray-900 truncate">{influencer.name}</h4>
                    <span className="text-xs text-gray-500 ml-2">{influencer.messages} msgs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Response: </span>
                      <span className="text-green-600">{influencer.responseRate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Time: </span>
                      <span className="text-gray-900">{influencer.avgResponseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message Timeline Chart Placeholder */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Message Activity Over Time</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Chart visualization would go here</p>
            <p className="text-xs text-gray-500">Use recharts library for implementation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
