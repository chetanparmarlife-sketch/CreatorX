'use client'

import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

interface ListCard {
  id: number
  name: string
  count: number
  description: string
  color: string
}

const mockLists: ListCard[] = [
  {
    id: 1,
    name: 'Fashion Influencers',
    count: 24,
    description: 'Top fashion and lifestyle creators for summer campaign',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    id: 2,
    name: 'Tech Reviewers',
    count: 15,
    description: 'Technology and gadget review specialists',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 3,
    name: 'Food Bloggers',
    count: 32,
    description: 'Food and recipe content creators',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    id: 4,
    name: 'Fitness Coaches',
    count: 18,
    description: 'Health, fitness, and wellness influencers',
    color: 'bg-green-100 text-green-700',
  },
]

export default function InfluencerListsPage() {
  return (
    <div>
      <PageHeader
        title="Influencer Lists"
        ctaLabel="Create List"
        onCtaClick={() => console.log('Create list')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-sky-400 hover:bg-sky-50 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-sky-100 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-sky-600" />
          </div>
          <h3 className="text-gray-900 font-medium mb-1">Create New List</h3>
          <p className="text-sm text-gray-600 text-center">
            Organize influencers into custom lists
          </p>
        </button>

        {mockLists.map((list) => (
          <div
            key={list.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${list.color} flex items-center justify-center`}>
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">{list.count} influencers</span>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">{list.name}</h3>
            <p className="text-sm text-gray-600">{list.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
