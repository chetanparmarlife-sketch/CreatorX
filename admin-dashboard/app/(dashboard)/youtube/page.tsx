'use client'

import { Search, ChevronDown, MapPin, Users, TrendingUp, Tag } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'

interface Influencer {
  id: number
  name: string
  handle: string
  avatar: string
  gender: string
  age: number
  location: string
  subscribers: string
  engagement: string
  industries: string[]
}

const mockInfluencers: Influencer[] = [
  {
    id: 1,
    name: 'Tech Guru India',
    handle: '@techguruindia',
    avatar: 'https://i.pravatar.cc/150?img=30',
    gender: 'Male',
    age: 32,
    location: 'Bangalore, India',
    subscribers: '1.2M',
    engagement: '5.2%',
    industries: ['Technology', 'Gadgets'],
  },
  {
    id: 2,
    name: 'Foodie Adventures',
    handle: '@foodieadventures',
    avatar: 'https://i.pravatar.cc/150?img=35',
    gender: 'Female',
    age: 28,
    location: 'Mumbai, India',
    subscribers: '850K',
    engagement: '4.8%',
    industries: ['Food', 'Travel'],
  },
  {
    id: 3,
    name: 'Fitness First',
    handle: '@fitnessfirstindia',
    avatar: 'https://i.pravatar.cc/150?img=40',
    gender: 'Male',
    age: 30,
    location: 'Delhi, India',
    subscribers: '620K',
    engagement: '6.1%',
    industries: ['Fitness', 'Health'],
  },
  {
    id: 4,
    name: 'Beauty Blend',
    handle: '@beautyblend',
    avatar: 'https://i.pravatar.cc/150?img=45',
    gender: 'Female',
    age: 26,
    location: 'Hyderabad, India',
    subscribers: '480K',
    engagement: '5.5%',
    industries: ['Beauty', 'Fashion'],
  },
]

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  )
}

export default function YouTubePage() {
  return (
    <div>
      <PageHeader title="YouTube" />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search YouTube channels..."
            className="pl-10 h-11 bg-white border-gray-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterButton label="Subscribers" />
          <FilterButton label="Video Views" />
          <FilterButton label="Content Type" />
          <FilterButton label="Language" />
          <FilterButton label="Cities" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Channel</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Gender</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Age</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Location</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Subscribers</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Engagement</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Categories</th>
            </tr>
          </thead>
          <tbody>
            {mockInfluencers.map((influencer) => (
              <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{influencer.name}</div>
                      <div className="text-xs text-gray-500">{influencer.handle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{influencer.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{influencer.age}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {influencer.location}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    {influencer.subscribers}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    {influencer.engagement}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {influencer.industries.map((industry, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700"
                      >
                        <Tag className="w-3 h-3" />
                        {industry}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
