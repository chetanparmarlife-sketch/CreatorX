'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCreators } from '@/lib/hooks/use-creators'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useInviteCreator } from '@/lib/hooks/use-creators'

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
  const [inviteCreatorId, setInviteCreatorId] = useState<string | number | null>(null)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteCampaignId, setInviteCampaignId] = useState('')

  const { data, isLoading, error } = useCreators({
    search: search || undefined,
    category: selectedCategories.length ? selectedCategories.join(',') : undefined,
    platform: selectedPlatforms.length ? selectedPlatforms[0].toUpperCase() : undefined,
    minFollowers: followerRange[0],
    maxFollowers: followerRange[1],
    page,
    size: 20,
  })

  const creators: CreatorCard[] = data?.items ?? data ?? []
  const { data: campaignsData } = useCampaigns({}, 0)
  const inviteMutation = useInviteCreator()
  const campaigns = campaignsData?.items ?? []

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const needle = search.toLowerCase()
      const matchesSearch =
        !search.trim() ||
        creator.name?.toLowerCase().includes(needle) ||
        creator.bio?.toLowerCase().includes(needle) ||
        creator.category?.toLowerCase().includes(needle)
      const engagement = creator.engagementRate ?? 0
      const matchesEngagement =
        engagement >= engagementRange[0] && engagement <= engagementRange[1]
      const matchesLocation =
        !location.trim() ||
        creator.location?.toLowerCase().includes(location.toLowerCase())
      return matchesSearch && matchesEngagement && matchesLocation
    })
  }, [creators, engagementRange, location, search])

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
                    <div className="flex w-full gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/creators/${creator.id}`}>View Profile</Link>
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setInviteCreatorId(creator.id)
                          setInviteMessage('')
                          setInviteCampaignId('')
                        }}
                      >
                        Invite
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={inviteCreatorId !== null} onOpenChange={(open) => !open && setInviteCreatorId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Creator</DialogTitle>
            <DialogDescription>Select a campaign and add a note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <select
              value={inviteCampaignId}
              onChange={(event) => setInviteCampaignId(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
            <Textarea
              value={inviteMessage}
              onChange={(event) => setInviteMessage(event.target.value)}
              placeholder="Add a personal note..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteCreatorId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!inviteCreatorId || !inviteCampaignId) return
                inviteMutation.mutate({
                  campaignId: inviteCampaignId,
                  creatorId: inviteCreatorId,
                  message: inviteMessage.trim() || 'You are invited to this campaign.',
                })
                setInviteCreatorId(null)
              }}
              disabled={!inviteCampaignId || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
