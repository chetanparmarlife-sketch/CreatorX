'use client'

import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface OnboardingBannerProps {
  onboardingStatus?: string | null
}

export function OnboardingBanner({ onboardingStatus }: OnboardingBannerProps) {
  if (!onboardingStatus || onboardingStatus === 'APPROVED') return null

  const config: Record<string, {
    icon: React.ReactNode
    title: string
    description: string
    variant: 'default' | 'destructive'
    action?: { label: string; href: string }
  }> = {
    DRAFT: {
      icon: <FileText className="h-4 w-4" />,
      title: 'Complete Your Onboarding',
      description: 'Submit your company details and GST verification document to start creating campaigns.',
      variant: 'default',
      action: { label: 'Complete Profile', href: '/profile' },
    },
    SUBMITTED: {
      icon: <Clock className="h-4 w-4" />,
      title: 'Application Under Review',
      description: 'Your onboarding application has been submitted. Our team is reviewing your documents. This usually takes 1-2 business days.',
      variant: 'default',
    },
    UNDER_REVIEW: {
      icon: <Clock className="h-4 w-4" />,
      title: 'Application Under Review',
      description: 'Our team is currently reviewing your onboarding application. You will be notified once the review is complete.',
      variant: 'default',
    },
    REJECTED: {
      icon: <XCircle className="h-4 w-4" />,
      title: 'Application Rejected',
      description: 'Your onboarding application was not approved. Please update your details and resubmit.',
      variant: 'destructive',
      action: { label: 'Update & Resubmit', href: '/profile' },
    },
  }

  const current = config[onboardingStatus]
  if (!current) return null

  return (
    <Alert variant={current.variant} className="mb-6">
      {current.icon}
      <AlertTitle>{current.title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{current.description}</span>
        {current.action && (
          <Button variant={current.variant === 'destructive' ? 'destructive' : 'outline'} size="sm" asChild className="shrink-0">
            <Link href={current.action.href}>{current.action.label}</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
