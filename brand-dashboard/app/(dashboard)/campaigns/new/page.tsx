'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Wallet, Loader2, AlertCircle } from 'lucide-react'
import { useCreateCampaign } from '@/lib/hooks/use-campaigns'
import { useTemplates } from '@/lib/hooks/use-templates'
import { CampaignPlatform, CampaignStatus, Campaign } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBrandWallet, useAllocateToCampaign } from '@/lib/hooks/use-wallet'
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'

// Categories
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
] as const

// Platforms
const platforms = [
  { value: CampaignPlatform.INSTAGRAM, label: 'Instagram' },
  { value: CampaignPlatform.YOUTUBE, label: 'YouTube' },
  { value: CampaignPlatform.TWITTER, label: 'Twitter' },
  { value: CampaignPlatform.TIKTOK, label: 'TikTok' },
  { value: CampaignPlatform.FACEBOOK, label: 'Facebook' },
  { value: CampaignPlatform.LINKEDIN, label: 'LinkedIn' },
] as const

// Deliverable types
const deliverableTypes = [
  { value: 'IMAGE', label: 'Image Post' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'STORY', label: 'Story' },
  { value: 'REEL', label: 'Reel' },
] as const

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const budgetGuidanceByPlatform: Record<
  CampaignPlatform,
  { starter: string; growth: string; launch: string; note: string }
> = {
  [CampaignPlatform.INSTAGRAM]: {
    starter: 'INR 10k-25k',
    growth: 'INR 25k-75k',
    launch: 'INR 75k+',
    note: 'Strong for reels + stories with mid-tier creators.',
  },
  [CampaignPlatform.YOUTUBE]: {
    starter: 'INR 20k-50k',
    growth: 'INR 50k-150k',
    launch: 'INR 150k+',
    note: 'Allocate extra budget for long-form production time.',
  },
  [CampaignPlatform.TWITTER]: {
    starter: 'INR 5k-15k',
    growth: 'INR 15k-40k',
    launch: 'INR 40k+',
    note: 'Great for fast engagement and announcements.',
  },
  [CampaignPlatform.TIKTOK]: {
    starter: 'INR 10k-30k',
    growth: 'INR 30k-80k',
    launch: 'INR 80k+',
    note: 'Prioritize creators with high short-form velocity.',
  },
  [CampaignPlatform.FACEBOOK]: {
    starter: 'INR 8k-20k',
    growth: 'INR 20k-60k',
    launch: 'INR 60k+',
    note: 'Works best with community-driven deliverables.',
  },
  [CampaignPlatform.LINKEDIN]: {
    starter: 'INR 15k-40k',
    growth: 'INR 40k-100k',
    launch: 'INR 100k+',
    note: 'B2B creators typically require higher CPM.',
  },
}

// Zod schema for deliverable
const deliverableSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'STORY', 'REEL']),
  dueDate: z.date({ required_error: 'Due date is required' }),
  isMandatory: z.boolean().default(true),
  price: z.number().min(0).optional(),
})

// Main form schema
const campaignSchema = z
  .object({
    // Step 1: Basic Information
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must not exceed 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must not exceed 2000 characters'),
    platform: z.nativeEnum(CampaignPlatform, {
      required_error: 'Please select a platform',
    }),
    category: z.enum(categories, {
      required_error: 'Please select a category',
    }),
    budget: z.number().min(1000, 'Budget must be at least INR 1,000'),

    // Step 2: Requirements & Deliverables
    requirements: z.string().optional(),
    deliverables: z.array(deliverableSchema).optional(),

    // Step 3: Timeline
    startDate: z.date({
      required_error: 'Start date is required',
    }),
    endDate: z.date({
      required_error: 'End date is required',
    }),
    applicationDeadline: z.date().optional(),
    maxApplicants: z.number().min(1).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.applicationDeadline) {
        return data.applicationDeadline <= data.endDate
      }
      return true
    },
    {
      message: 'Application deadline must be before or on end date',
      path: ['applicationDeadline'],
    }
  )

type CampaignFormValues = z.infer<typeof campaignSchema>

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Campaign details' },
  { id: 2, title: 'Requirements & Deliverables', description: 'What creators need to deliver' },
  { id: 3, title: 'Timeline', description: 'Campaign dates and review' },
] as const

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authUser = useAuthStore((s) => s.user)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [showFundingDialog, setShowFundingDialog] = useState(false)
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null)
  const [fundingStep, setFundingStep] = useState<'check' | 'complete'>('check')
  const createCampaign = useCreateCampaign()
  const { data: templates = [] } = useTemplates()
  const { data: wallet, refetch: refetchWallet } = useBrandWallet()
  const allocateMutation = useAllocateToCampaign()
  const { track } = useBrandEventTracker({
    walletBalance: wallet?.balance ?? null,
  })
  const source = searchParams.get('source')

  const formatApiError = (error: unknown, fallback: string) => {
    if (!error || typeof error !== 'object') return fallback
    const err = error as { message?: string; details?: Record<string, string> }
    const message = typeof err.message === 'string' ? err.message : fallback
    if (err.details && typeof err.details === 'object') {
      const detailText = Object.entries(err.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' - ')
      return detailText ? `${message}. ${detailText}` : message
    }
    return message
  }

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      platform: undefined,
      category: undefined,
      budget: 10000,
      requirements: '',
      deliverables: [],
      startDate: undefined,
      endDate: undefined,
      applicationDeadline: undefined,
      maxApplicants: undefined,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'deliverables',
  })

  const watchStartDate = form.watch('startDate')
  const watchEndDate = form.watch('endDate')
  const watchPlatform = form.watch('platform')
  const watchTitle = form.watch('title')
  const watchDescription = form.watch('description')
  const watchBudget = form.watch('budget')
  const watchDeliverables = form.watch('deliverables')
  const watchRequirements = form.watch('requirements')
  const budgetGuidance = watchPlatform ? budgetGuidanceByPlatform[watchPlatform] : null
  const checklistItems = [
    {
      label: 'Title and description are clear',
      complete: !!watchTitle && watchTitle.length >= 5 && !!watchDescription && watchDescription.length >= 20,
    },
    {
      label: 'Budget and platform are set',
      complete: !!watchBudget && watchBudget >= 1000 && !!watchPlatform,
    },
    {
      label: 'Deliverables defined',
      complete: Array.isArray(watchDeliverables) && watchDeliverables.length > 0,
    },
    {
      label: 'Timeline dates selected',
      complete: !!watchStartDate && !!watchEndDate,
    },
    {
      label: 'Requirements or guidelines added',
      complete: !!watchRequirements && watchRequirements.length >= 10,
    },
  ]

  // Validate current step before proceeding
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof CampaignFormValues)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ['title', 'description', 'platform', 'category', 'budget']
        break
      case 2:
        fieldsToValidate = ['requirements']
        // Validate deliverables if any
        if (fields.length > 0) {
          const deliverablesResult = await form.trigger('deliverables' as any)
          if (!deliverablesResult) return false
        }
        break
      case 3:
        fieldsToValidate = ['startDate', 'endDate']
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddDeliverable = () => {
    append({
      title: '',
      description: '',
      type: 'IMAGE',
      dueDate: watchEndDate ?? watchStartDate ?? new Date(),
      isMandatory: true,
    })
  }

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const templateFallbackDate = template.endDate ?? template.startDate ?? new Date().toISOString()

    form.reset({
      title: template.title || '',
      description: template.description || '',
      platform: template.platform,
      category: template.category as any,
      budget: template.budget || 0,
      requirements: template.requirements || '',
      deliverables: (template.deliverables || []).map((item) => ({
        title: item.title,
        description: item.description || '',
        type: item.type as any,
        dueDate: item.dueDate ? new Date(item.dueDate) : new Date(templateFallbackDate),
        isMandatory: item.isMandatory ?? true,
      })),
      startDate: template.startDate ? new Date(template.startDate) : undefined,
      endDate: template.endDate ? new Date(template.endDate) : undefined,
      applicationDeadline: template.applicationDeadline
        ? new Date(template.applicationDeadline)
        : undefined,
      maxApplicants: template.maxApplicants,
    })
  }

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const deliverables = data.deliverables ?? []
      if (deliverables.length === 0) {
        setSubmitError('Please add at least one deliverable.')
        setIsSubmitting(false)
        return
      }

      // Format dates to ISO strings
      const campaignData = {
        title: data.title,
        description: data.description,
        platform: data.platform,
        category: data.category,
        budget: data.budget,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        applicationDeadline: data.applicationDeadline
          ? format(data.applicationDeadline, 'yyyy-MM-dd')
          : undefined,
        maxApplicants: data.maxApplicants,
        requirements: data.requirements,
        deliverableTypes: deliverables.map((d: { type: string }) => d.type),
        deliverables: deliverables.map((deliverable: { title: string; description?: string; type: string; dueDate?: Date; isMandatory: boolean; price?: number }, index: number) => ({
          title: deliverable.title,
          description: deliverable.description,
          type: deliverable.type,
          dueDate: deliverable.dueDate
            ? format(deliverable.dueDate, 'yyyy-MM-dd')
            : undefined,
          isMandatory: deliverable.isMandatory,
          orderIndex: index,
          price: deliverable.price || undefined,
        })),
      }

      const created = await createCampaign.mutateAsync(campaignData)
      setCreatedCampaign(created)

      if (source === 'dashboard') {
        track('campaign_created_from_dashboard', {
          campaign_id: created.id,
          campaign_budget: created.budget,
          campaign_platform: created.platform,
          deliverables_count: deliverables.length,
        })
      }

      // Campaign created successfully - now check wallet balance
      // Fetch latest wallet balance
      const { data: currentWallet } = await refetchWallet()

      // Check if brand has sufficient balance
      if (!currentWallet || currentWallet.balance === 0) {
        // No wallet or empty balance - redirect to add funds
        router.push(
          `/payments?action=deposit&amount=${created.budget}&campaignId=${created.id}`
        )
        return
      }

      if (currentWallet.balance < created.budget) {
        // Insufficient balance - show funding dialog with options
        setFundingStep('check')
        setShowFundingDialog(true)
      } else {
        // Sufficient balance - show funding dialog with fund now option
        setFundingStep('check')
        setShowFundingDialog(true)
      }
    } catch (error: unknown) {
      setSubmitError(formatApiError(error, 'Failed to create campaign. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    const formData = form.getValues()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const deliverables = formData.deliverables ?? []
      if (deliverables.length === 0) {
        setSubmitError('Please add at least one deliverable to save a draft.')
        setIsSubmitting(false)
        return
      }

      // Save as draft - only require title
      if (!formData.title || formData.title.length < 5) {
        setSubmitError('Title is required (minimum 5 characters) to save as draft')
        setIsSubmitting(false)
        return
      }

      const campaignData = {
        title: formData.title,
        description: formData.description || '',
        platform: formData.platform || CampaignPlatform.INSTAGRAM,
        category: formData.category || 'Other',
        budget: formData.budget || 10000,
        startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        applicationDeadline: formData.applicationDeadline
          ? format(formData.applicationDeadline, 'yyyy-MM-dd')
          : undefined,
        maxApplicants: formData.maxApplicants,
        requirements: formData.requirements,
        deliverableTypes: deliverables.map((d) => d.type),
        deliverables: deliverables.map((deliverable, index) => ({
          title: deliverable.title,
          description: deliverable.description,
          type: deliverable.type,
          dueDate: deliverable.dueDate
            ? format(deliverable.dueDate, 'yyyy-MM-dd')
            : undefined,
          isMandatory: deliverable.isMandatory,
          orderIndex: index,
        })),
      }

      // Note: Backend should handle status=DRAFT when not all required fields are present
      // For now, we'll create with minimal data
      const created = await createCampaign.mutateAsync(campaignData)
      router.push(`/campaigns/${created.id}`)
    } catch (error: unknown) {
      setSubmitError(formatApiError(error, 'Failed to save draft. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gate: block campaign creation for non-approved brands
  if (authUser?.onboardingStatus && authUser.onboardingStatus !== 'APPROVED') {
    const statusMessages: Record<string, { title: string; description: string }> = {
      DRAFT: {
        title: 'Complete Onboarding First',
        description: 'You need to submit your company details and GST verification document before creating campaigns.',
      },
      SUBMITTED: {
        title: 'Onboarding Under Review',
        description: 'Your onboarding application is being reviewed. You can create campaigns once approved.',
      },
      UNDER_REVIEW: {
        title: 'Onboarding Under Review',
        description: 'Our team is reviewing your application. You will be able to create campaigns once approved.',
      },
      REJECTED: {
        title: 'Onboarding Not Approved',
        description: 'Your onboarding application was not approved. Please update your details and resubmit to start creating campaigns.',
      },
    }
    const msg = statusMessages[authUser.onboardingStatus] || statusMessages.DRAFT
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-amber-100 p-4 mb-6">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{msg.title}</h2>
        <p className="text-slate-600 max-w-md mb-6">{msg.description}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button asChild>
            <Link href="/profile">Go to Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Create Campaign</h1>
            <p className="text-sm text-slate-500 mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors
                    ${currentStep > step.id
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : currentStep === step.id
                        ? 'border-purple-600 bg-white text-purple-600'
                        : 'border-slate-300 bg-white text-slate-400'
                    }
                  `}
                >
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-xs text-center ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                  }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Use a template</p>
                        <p className="text-xs text-slate-500">
                          Prefill your campaign from a saved template.
                        </p>
                      </div>
                      <select
                        value={selectedTemplateId ?? ''}
                        onChange={(event) => applyTemplate(event.target.value)}
                        className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select template</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Summer Fashion Campaign 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/100 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your campaign, what you're looking for, and what creators will need to do..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value as CampaignPlatform)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                {platform.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (INR) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1000"
                          step="1000"
                          placeholder="10000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum budget: INR 1,000
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Budget guidance {watchPlatform ? `for ${watchPlatform}` : ''}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Use a tiered budget to match creator reach and content volume.
                  </p>
                  {budgetGuidance ? (
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <p className="font-semibold text-slate-900">Starter</p>
                        <p>{budgetGuidance.starter}</p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <p className="font-semibold text-slate-900">Growth</p>
                        <p>{budgetGuidance.growth}</p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <p className="font-semibold text-slate-900">Launch</p>
                        <p>{budgetGuidance.launch}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Select a platform to see recommended budget ranges.
                    </p>
                  )}
                  {budgetGuidance && (
                    <p className="mt-2 text-xs text-slate-500">{budgetGuidance.note}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Requirements & Deliverables */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Deliverables</CardTitle>
                <CardDescription>
                  Specify what creators need to deliver for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requirements, guidelines, or instructions for creators..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Provide additional guidelines for creators
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Deliverables</h3>
                      <p className="text-xs text-slate-500">
                        Define what content creators need to submit
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddDeliverable}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Deliverable
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <p className="text-sm text-slate-500">
                        No deliverables added yet. Click &quot;Add Deliverable&quot; to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="absolute right-4 top-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-4 pr-8">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">Deliverable {index + 1}</Badge>
                              </div>

                              <FormField
                                control={form.control}
                                name={`deliverables.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Instagram Post"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`deliverables.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Describe what needs to be delivered..."
                                        className="min-h-[80px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name={`deliverables.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Type *</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {deliverableTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`deliverables.${index}.dueDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Due Date *</FormLabel>
                                      <FormControl>
                                        <DatePicker
                                          date={field.value}
                                          onSelect={field.onChange}
                                          placeholder="Select due date"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`deliverables.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price (INR)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="100"
                                        placeholder="Leave empty for equal split"
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value ? Number(e.target.value) : undefined
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Custom payment for this deliverable. If empty, budget is split equally.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`deliverables.${index}.isMandatory`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        Mandatory
                                      </FormLabel>
                                      <FormDescription>
                                        Is this deliverable required?
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Timeline & Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>
                    Set campaign dates and review all information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              placeholder="Select start date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              placeholder="Select end date"
                              disabled={
                                !watchStartDate ||
                                (watchStartDate &&
                                  watchEndDate &&
                                  watchEndDate < watchStartDate)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Must be after start date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              placeholder="Select deadline (optional)"
                              disabled={!watchEndDate}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: When should creators stop applying?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxApplicants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Applicants</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="No limit"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Maximum number of creators to select
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Review Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Review</CardTitle>
                  <CardDescription>
                    Review your campaign details before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Title</p>
                      <p className="text-sm text-slate-900">{form.watch('title') || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Platform</p>
                      <p className="text-sm text-slate-900">
                        {form.watch('platform')
                          ? platforms.find((p) => p.value === form.watch('platform'))?.label
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Category</p>
                      <p className="text-sm text-slate-900">{form.watch('category') || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Budget</p>
                      <p className="text-sm text-slate-900">
                        INR {form.watch('budget')?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Start Date</p>
                      <p className="text-sm text-slate-900">
                        {form.watch('startDate')
                          ? format(form.watch('startDate')!, 'PPP')
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">End Date</p>
                      <p className="text-sm text-slate-900">
                        {form.watch('endDate')
                          ? format(form.watch('endDate')!, 'PPP')
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {form.watch('description') && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Description</p>
                      <p className="text-sm text-slate-900 line-clamp-3">
                        {form.watch('description')}
                      </p>
                    </div>
                  )}

                  {fields.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Deliverables ({fields.length})
                      </p>
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="rounded-lg border bg-slate-50 p-3"
                          >
                            <p className="text-sm font-medium">
                              {form.watch(`deliverables.${index}.title`) || `Deliverable ${index + 1}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {form.watch(`deliverables.${index}.type`) || 'Not specified'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Alert>
                    <AlertDescription>
                      After submission, your campaign may appear as{' '}
                      <span className="font-semibold text-slate-900">PENDING_REVIEW</span> until
                      it is approved. We will notify you as soon as it is live.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ready-to-launch checklist</CardTitle>
                  <CardDescription>
                    Confirm the essentials so approvals move fast.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklistItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border bg-white p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2
                          className={`h-4 w-4 ${item.complete ? 'text-emerald-500' : 'text-slate-300'}`}
                        />
                        {item.label}
                      </div>
                      <Badge className={item.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                        {item.complete ? 'Ready' : 'Needs input'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t pt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* Funding Dialog */}
      {showFundingDialog && createdCampaign && wallet && (
        <Dialog open={showFundingDialog} onOpenChange={setShowFundingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Fund Your Campaign</DialogTitle>
              <DialogDescription>
                Your campaign &ldquo;{createdCampaign.title}&rdquo; has been created successfully.
              </DialogDescription>
            </DialogHeader>

            {fundingStep === 'check' && (
              <div className="space-y-4">
                <Alert className={
                  wallet.balance >= createdCampaign.budget
                    ? "border-green-200 bg-green-50"
                    : "border-orange-200 bg-orange-50"
                }>
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Current Balance</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(wallet.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Required</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(createdCampaign.budget)}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {wallet.balance >= createdCampaign.budget ? (
                  // Sufficient balance
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          await allocateMutation.mutateAsync({
                            campaignId: createdCampaign.id,
                            request: { amount: createdCampaign.budget },
                          })
                          setFundingStep('complete')
                        } catch (error: any) {
                          alert('Failed to fund campaign: ' + (error?.message || 'Unknown error'))
                        }
                      }}
                      disabled={allocateMutation.isPending}
                      className="flex-1"
                    >
                      {allocateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Funding...
                        </>
                      ) : (
                        'Fund Now'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push(`/campaigns/${createdCampaign.id}/applications`)
                      }}
                    >
                      Fund Later
                    </Button>
                  </div>
                ) : (
                  // Insufficient balance
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You need {formatCurrency(createdCampaign.budget - wallet.balance)} more
                      to fund this campaign.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          router.push(
                            `/payments?action=deposit&amount=${
                              createdCampaign.budget - wallet.balance
                            }&campaignId=${createdCampaign.id}`
                          )
                        }}
                        className="flex-1"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Funds
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push(`/campaigns/${createdCampaign.id}/applications`)
                        }}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {fundingStep === 'complete' && (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Campaign Funded!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your campaign is now active and ready for applications.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    router.push(`/campaigns/${createdCampaign.id}/applications`)
                  }}
                  className="w-full"
                >
                  View Campaign
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
