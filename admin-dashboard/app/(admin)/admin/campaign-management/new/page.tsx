'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminCampaignManagementService } from '@/lib/api/admin/campaign-management'
import { adminUserService } from '@/lib/api/admin/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CampaignPlatform, UserRole } from '@/lib/types'

export default function AdminCampaignCreatePage() {
  const router = useRouter()
  const [brandId, setBrandId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [platform, setPlatform] = useState<CampaignPlatform | ''>('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [maxApplicants, setMaxApplicants] = useState('')
  const [requirements, setRequirements] = useState('')
  const [deliverables, setDeliverables] = useState<
    { title: string; description?: string; type: string; dueDate?: string; isMandatory: boolean }[]
  >([])

  const categories = [
    'Fashion',
    'Beauty',
    'Tech',
    'Lifestyle',
    'Food',
    'Travel',
    'Fitness',
    'Gaming',
    'Education',
    'Other',
  ]

  const deliverableTypes = ['IMAGE', 'VIDEO', 'STORY', 'REEL']

  const budgetGuidanceByPlatform: Record<
    CampaignPlatform,
    { starter: string; growth: string; launch: string; note: string }
  > = {
    [CampaignPlatform.INSTAGRAM]: {
      starter: '₹10k–25k',
      growth: '₹25k–75k',
      launch: '₹75k+',
      note: 'Strong for reels + stories with mid-tier creators.',
    },
    [CampaignPlatform.YOUTUBE]: {
      starter: '₹20k–50k',
      growth: '₹50k–150k',
      launch: '₹150k+',
      note: 'Allocate extra budget for long-form production time.',
    },
    [CampaignPlatform.TWITTER]: {
      starter: '₹5k–15k',
      growth: '₹15k–40k',
      launch: '₹40k+',
      note: 'Great for fast engagement and announcements.',
    },
    [CampaignPlatform.TIKTOK]: {
      starter: '₹10k–30k',
      growth: '₹30k–80k',
      launch: '₹80k+',
      note: 'Prioritize creators with high short-form velocity.',
    },
    [CampaignPlatform.FACEBOOK]: {
      starter: '₹8k–20k',
      growth: '₹20k–60k',
      launch: '₹60k+',
      note: 'Works best with community-driven deliverables.',
    },
    [CampaignPlatform.LINKEDIN]: {
      starter: '₹15k–40k',
      growth: '₹40k–100k',
      launch: '₹100k+',
      note: 'B2B creators typically require higher CPM.',
    },
  }

  const budgetGuidance = platform ? budgetGuidanceByPlatform[platform as CampaignPlatform] : null

  const { data: brands } = useQuery({
    queryKey: ['admin-brand-users-create'],
    queryFn: () => adminUserService.listUsers({ role: UserRole.BRAND, page: 0, size: 200 }),
  })

  const brandOptions = useMemo(
    () => (brands as any)?.items ?? (brands as any)?.content ?? [],
    [brands]
  )

  const createMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.createCampaign(brandId, {
        title,
        description,
        budget: Number(budget),
        platform: platform as CampaignPlatform,
        category,
        startDate,
        endDate,
        applicationDeadline: applicationDeadline || undefined,
        maxApplicants: maxApplicants ? Number(maxApplicants) : undefined,
        requirements: requirements || undefined,
        deliverables: deliverables.length
          ? deliverables.map((item, index) => ({
              title: item.title,
              description: item.description,
              type: item.type,
              dueDate: item.dueDate || undefined,
              isMandatory: item.isMandatory,
              orderIndex: index,
            }))
          : undefined,
      }),
    onSuccess: (campaign) => {
      router.push(`/admin/campaign-management/${campaign.id}`)
    },
  })

  const isValid =
    brandId &&
    title.trim().length >= 5 &&
    description.trim().length >= 20 &&
    Number(budget) > 0 &&
    platform &&
    category.trim().length > 0 &&
    startDate &&
    endDate

  const checklist = [
    {
      label: 'Brand selected',
      complete: !!brandId,
    },
    {
      label: 'Title and description are set',
      complete: title.trim().length >= 5 && description.trim().length >= 20,
    },
    {
      label: 'Budget + platform defined',
      complete: Number(budget) > 0 && !!platform,
    },
    {
      label: 'Timeline scheduled',
      complete: !!startDate && !!endDate,
    },
    {
      label: 'Deliverables listed',
      complete: deliverables.length > 0,
    },
  ]

  const addDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      { title: '', description: '', type: 'IMAGE', dueDate: '', isMandatory: true },
    ])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Create Campaign</h1>
        <p className="text-slate-500">
          Launch a campaign on behalf of a brand with the same structure used in the brand workflow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Brand + Basics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Brand</label>
                <select
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={brandId}
                  onChange={(event) => setBrandId(event.target.value)}
                >
                  <option value="">Select brand</option>
                  {brandOptions.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.companyName || brand.fullName || brand.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Platform</label>
                <select
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as CampaignPlatform)}
                >
                  <option value="">Select platform</option>
                  {Object.values(CampaignPlatform).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Campaign title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Summer launch series" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the campaign goals, deliverables, and expectations."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Budget (INR)</label>
                <Input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Max applicants</label>
                <Input
                  type="number"
                  min="1"
                  value={maxApplicants}
                  onChange={(event) => setMaxApplicants(event.target.value)}
                  placeholder="25"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Requirements + Deliverables</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Requirements</label>
              <textarea
                className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                placeholder="Key requirements for creators or deliverables."
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Deliverables</p>
                <Button variant="outline" size="sm" onClick={addDeliverable}>
                  Add deliverable
                </Button>
              </div>
              {deliverables.length === 0 ? (
                <p className="text-sm text-slate-500">Add at least one deliverable to align with the brand workflow.</p>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((deliverable, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-slate-600">Title</label>
                          <Input
                            value={deliverable.title}
                            onChange={(event) => {
                              const next = [...deliverables]
                              next[index].title = event.target.value
                              setDeliverables(next)
                            }}
                            placeholder="Story post + link"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Type</label>
                          <select
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                            value={deliverable.type}
                            onChange={(event) => {
                              const next = [...deliverables]
                              next[index].type = event.target.value
                              setDeliverables(next)
                            }}
                          >
                            {deliverableTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-slate-600">Description</label>
                          <Input
                            value={deliverable.description || ''}
                            onChange={(event) => {
                              const next = [...deliverables]
                              next[index].description = event.target.value
                              setDeliverables(next)
                            }}
                            placeholder="Describe what the creator should deliver."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Due date</label>
                          <Input
                            type="date"
                            value={deliverable.dueDate || ''}
                            onChange={(event) => {
                              const next = [...deliverables]
                              next[index].dueDate = event.target.value
                              setDeliverables(next)
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={deliverable.isMandatory}
                            onChange={(event) => {
                              const next = [...deliverables]
                              next[index].isMandatory = event.target.checked
                              setDeliverables(next)
                            }}
                          />
                          Mandatory deliverable
                        </label>
                        <button
                          className="text-rose-600 font-semibold"
                          onClick={() => setDeliverables(deliverables.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start date</label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End date</label>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Application deadline</label>
                <Input
                  type="date"
                  value={applicationDeadline}
                  onChange={(event) => setApplicationDeadline(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/admin/campaign-management')}>
              Back
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={!isValid || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create campaign'}
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900">Budget guidance</p>
            {budgetGuidance ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Starter:</span> {budgetGuidance.starter}</p>
                <p><span className="font-semibold text-slate-900">Growth:</span> {budgetGuidance.growth}</p>
                <p><span className="font-semibold text-slate-900">Launch:</span> {budgetGuidance.launch}</p>
                <p className="text-xs text-slate-500">{budgetGuidance.note}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a platform to see budget ranges.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900">Ready-to-launch checklist</p>
            <div className="space-y-2 text-sm">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={item.complete ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                    {item.complete ? 'Ready' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Next actions</p>
            <p>Create in draft, then submit for review or activate depending on pre-approval settings.</p>
            <p>After launch, use the Applications + Deliverables tabs to mirror brand operations.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
