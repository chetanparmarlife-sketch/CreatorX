'use client'

import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export function PageHeader({ title, ctaLabel, onCtaClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {ctaLabel && (
        <Button 
          onClick={onCtaClick}
          className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
