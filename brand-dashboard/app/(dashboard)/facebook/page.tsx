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
  followers: string
  engagement: string
  industries: string[]
}

const mockInfluencers: Influencer[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    handle: '@priyasharma.fb',
    avatar: 'https://i.pravatar.cc/150?img=20',
    gender: 'Female',
    age: 30,
    location: 'Mumbai, India',
    followers: '520K',
    engagement: '3.5%',
    industries: ['Lifestyle', 'Parenting'],
  },
  {
    id: 2,
    name: 'Rahul Verma',
    handle: '@rahulverma.official',
    avatar: 'https://i.pravatar.cc/150?img=15',
    gender: 'Male',
    age: 35,
    location: 'Delhi, India',
    followers: '380K',
    engagement: '2.9%',
    industries: ['Business', 'Motivation'],
  },
  {
    id: 3,
    name: 'Ananya Patel',
    handle: '@ananyacooks',
    avatar: 'https://i.pravatar.cc/150?img=25',
    gender: 'Female',
    age: 28,
    location: 'Ahmedabad, India',
    followers: '290K',
    engagement: '4.1%',
    industries: ['Food', 'Recipes'],
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

export default function FacebookPage() {
  return (
    <div>
      <PageHeader title="Facebook" />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Facebook pages..."
            className="pl-10 h-11 bg-white border-gray-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterButton label="Age Group" />
          <FilterButton label="Gender" />
          <FilterButton label="Page Likes" />
          <FilterButton label="Content Niche" />
          <FilterButton label="Cities" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Influencer</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Gender</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Age</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Location</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Page Likes</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Engagement</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Industries</th>
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
                    {influencer.followers}
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
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
