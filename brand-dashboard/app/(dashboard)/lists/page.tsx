'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { BrandCreatorList, listsService, normalizeBrandLists } from '@/lib/api/listsService'

interface ListCard {
  id: string | number
  name: string
  count: number
  description: string
  color: string
}

const listColors = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700',
]

export default function InfluencerListsPage() {
  const [backendLists, setBackendLists] = useState<BrandCreatorList[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true
    // Load influencer lists from backend instead of rendering mock data.
    listsService
      .getLists()
      .then((response) => {
        if (isMounted) {
          setBackendLists(normalizeBrandLists(response))
        }
      })
      .catch((err) => {
        console.error('Failed to load backend influencer lists:', err)
        if (isMounted) {
          setLoadError('Could not load influencer lists. Please try again.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const listCards = useMemo<ListCard[]>(
    // Backend list cards replace the old hardcoded mock list objects.
    () =>
      backendLists.map((list, index) => ({
        id: list.id,
        name: list.name ?? list.title ?? 'Untitled List',
        count: list.count ?? list.creatorCount ?? list.totalCreators ?? list.creatorIds?.length ?? list.creators?.length ?? 0,
        description: list.description ?? 'Creator shortlist saved to the backend.',
        color: listColors[index % listColors.length],
      })),
    [backendLists]
  )

  return (
    <div>
      <PageHeader
        title="Influencer Lists"
        subtitle="Organize and reuse creator shortlists by campaign goals and niche."
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

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {listCards.map((list) => (
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
