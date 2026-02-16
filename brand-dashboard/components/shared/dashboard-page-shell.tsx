import type { ReactNode } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils/cn'

type DashboardPageShellProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  ctaLabel?: string
  onCtaClick?: () => void
  actionBar?: ReactNode
  context?: ReactNode
  children: ReactNode
  loading?: boolean
  loadingFallback?: ReactNode
  errorMessage?: string
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  contentClassName?: string
}

export function DashboardPageShell({
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  onCtaClick,
  actionBar,
  context,
  children,
  loading = false,
  loadingFallback,
  errorMessage,
  empty = false,
  emptyTitle = 'No records yet',
  emptyDescription = 'Once data is available, it will appear here.',
  className,
  contentClassName,
}: DashboardPageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        ctaLabel={ctaLabel}
        onCtaClick={onCtaClick}
      />

      {actionBar ? <div>{actionBar}</div> : null}

      {loading ? (
        loadingFallback || (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading...
          </div>
        )
      ) : errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : empty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : context ? (
        <div className={cn('grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]', contentClassName)}>
          <section>{children}</section>
          <aside className="hidden lg:block">{context}</aside>
        </div>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
    </div>
  )
}
