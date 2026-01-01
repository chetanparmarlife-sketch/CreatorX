'use client'

import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export function PageHeader({ title, ctaLabel, onCtaClick }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        <div className="h-1 w-12 rounded-full bg-primary/70" />
      </div>
      {ctaLabel && (
        <Button 
          onClick={onCtaClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
