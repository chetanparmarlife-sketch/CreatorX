'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  ctaLabel?: string
  onCtaClick?: () => void
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  onCtaClick,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-center justify-between gap-4', className)}>
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
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
