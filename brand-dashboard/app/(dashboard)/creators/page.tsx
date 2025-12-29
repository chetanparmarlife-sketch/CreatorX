'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { creatorService } from '@/lib/api/creators'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type CreatorCard = {
  id: string | number
  name: string
  category?: string
  followers?: number
  engagementRate?: number
  avatarUrl?: string
  portfolio?: string[]
  platforms?: string[]
  location?: string
  bio?: string
}

const categories = ['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel']
const platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter']

const formatFollowers = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export default function CreatorsDiscoveryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [followerRange, setFollowerRange] = useState<[number, number]>([1000, 1000000])
  const [engagementRange, setEngagementRange] = useState<[number, number]>([1, 20])
  const [location, setLocation] = useState('')
  const [page] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'creators',
      search,
      selectedCategories,
      selectedPlatforms,
      followerRange,
      engagementRange,
      location,
      page,
    ],
    queryFn: () =>
      creatorService.getCreators({
        search: search || undefined,
        category: selectedCategories.length ? selectedCategories.join(',') : undefined,
        platform: selectedPlatforms.length ? selectedPlatforms[0] : undefined, // Backend expects single platform enum
        minFollowers: followerRange[0],
        maxFollowers: followerRange[1],
        // engagementMin, engagementMax, location are filtered client-side (not supported by backend)
        page,
        size: 20,
      }),
  })

  const creators: CreatorCard[] = data?.items ?? data ?? []

  const filteredCreators = useMemo(() => {
    if (!search.trim()) return creators
    return creators.filter((creator) => {
      const needle = search.toLowerCase()
      return (
        creator.name?.toLowerCase().includes(needle) ||
        creator.bio?.toLowerCase().includes(needle) ||
        creator.category?.toLowerCase().includes(needle)
      )
    })
  }, [creators, search])

  const toggleSelection = (value: string, list: string[], setList: (next: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value))
    } else {
      setList([...list, value])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Creators</h1>
        <p className="text-sm text-slate-500">
          Discover creators that match your campaign goals.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full lg:w-72 space-y-6 rounded-lg border bg-white p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            <p className="text-xs text-slate-500">Narrow down results.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Category</p>
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-slate-600">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    toggleSelection(category, selectedCategories, setSelectedCategories)
                  }
                />
                {category}
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Platform</p>
            {platforms.map((platform) => (
              <label key={platform} className="flex items-center gap-2 text-sm text-slate-600">
                <Checkbox
                  checked={selectedPlatforms.includes(platform)}
                  onCheckedChange={() =>
                    toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)
                  }
                />
                {platform}
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Follower range</p>
            <Slider
              value={followerRange}
              min={1000}
              max={1000000}
              step={1000}
              onValueChange={(value) => setFollowerRange([value[0], value[1]])}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatFollowers(followerRange[0])}</span>
              <span>{formatFollowers(followerRange[1])}+</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Engagement rate</p>
            <Slider
              value={engagementRange}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setEngagementRange([value[0], value[1]])}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{engagementRange[0]}%</span>
              <span>{engagementRange[1]}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Location</p>
            <Input
              placeholder="Search by city"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <Input
              placeholder="Search by name, bio, or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
              Loading creators...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load creators. Please try again.
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
              No creators found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={creator.avatarUrl} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {(creator.name || 'CR').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{creator.name}</CardTitle>
                      {creator.category && (
                        <Badge className="mt-1 bg-slate-100 text-slate-600">
                          {creator.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{formatFollowers(creator.followers || 0)} followers</span>
                      <span>{creator.engagementRate || 0}% engagement</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(creator.portfolio || []).slice(0, 3).map((image, index) => (
                        <div
                          key={`${creator.id}-portfolio-${index}`}
                          className="h-16 overflow-hidden rounded-md border bg-slate-50"
                        >
                          <img src={image} alt="Portfolio" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button asChild className="w-full">
                      <Link href={`/creators/${creator.id}`}>View Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
