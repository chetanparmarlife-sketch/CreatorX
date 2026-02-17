'use client'

import { Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface OnboardingBannerProps {
  onboardingStatus?: string | null
}

export function OnboardingBanner({ onboardingStatus }: OnboardingBannerProps) {
  // DRAFT and REJECTED are now hard-gated to /onboarding page
  // Banner only shows for SUBMITTED and UNDER_REVIEW
  if (!onboardingStatus || onboardingStatus === 'APPROVED' || onboardingStatus === 'DRAFT' || onboardingStatus === 'REJECTED') return null

  const config: Record<string, {
    icon: React.ReactNode
    title: string
    description: string
  }> = {
    SUBMITTED: {
      icon: <Clock className="h-4 w-4" />,
      title: 'Application Under Review',
      description: 'Your onboarding application has been submitted. Our team is reviewing your documents. This usually takes 1-2 business days.',
    },
    UNDER_REVIEW: {
      icon: <Clock className="h-4 w-4" />,
      title: 'Application Under Review',
      description: 'Our team is currently reviewing your onboarding application. You will be notified once the review is complete.',
    },
  }

  const current = config[onboardingStatus]
  if (!current) return null

  return (
    <Alert className="mb-6">
      {current.icon}
      <AlertTitle>{current.title}</AlertTitle>
      <AlertDescription>{current.description}</AlertDescription>
    </Alert>
  )
}
