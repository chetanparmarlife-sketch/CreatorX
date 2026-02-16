'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CampaignPlatform, CampaignTemplate } from '@/lib/types'
import { useDeleteTemplate, useTemplates, useUpdateTemplate } from '@/lib/hooks/use-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/page-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

export default function CampaignTemplatesPage() {
  const router = useRouter()
  const { data: templates = [], isLoading } = useTemplates()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [activeTemplate, setActiveTemplate] = useState<CampaignTemplate | null>(null)
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    budget: '',
    platform: CampaignPlatform.INSTAGRAM,
    category: categories[0],
    requirements: '',
  })

  const handleEdit = (template: CampaignTemplate) => {
    setActiveTemplate(template)
    setFormState({
      title: template.title || '',
      description: template.description || '',
      budget: String(template.budget ?? ''),
      platform: template.platform,
      category: template.category,
      requirements: template.requirements || '',
    })
  }

  const handleSave = () => {
    if (!activeTemplate) return
    updateTemplate.mutate({
      id: activeTemplate.id,
      payload: {
        title: formState.title,
        description: formState.description,
        budget: Number(formState.budget || 0),
        platform: formState.platform,
        category: formState.category,
        requirements: formState.requirements,
      },
    })
    setActiveTemplate(null)
  }

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(id)
  }

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => a.title.localeCompare(b.title)),
    [templates]
  )

  return (
    <div>
      <PageHeader
        title="Campaign Templates"
        subtitle="Save and reuse proven campaign structures for faster launches."
        ctaLabel="Create Campaign"
        onCtaClick={() => router.push('/campaigns/new')}
      />

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">Loading templates...</div>
      ) : sortedTemplates.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
          No templates yet. Save a template from an existing campaign.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border bg-white p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{template.title}</h3>
                <p className="text-sm text-slate-500">{template.category} | {template.platform}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{template.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleEdit(template)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(template.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!activeTemplate} onOpenChange={(open) => !open && setActiveTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update your template details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <Input
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                <Input
                  type="number"
                  value={formState.budget}
                  onChange={(event) => setFormState((prev) => ({ ...prev, budget: event.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                <select
                  value={formState.platform}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, platform: event.target.value as CampaignPlatform }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.values(CampaignPlatform).map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
                <Input
                  value={formState.requirements}
                  onChange={(event) => setFormState((prev) => ({ ...prev, requirements: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
