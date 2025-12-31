import { cn } from '@/lib/utils/cn'
import { StatusChip } from '@/components/shared/status-chip'

type SlaSummary = {
  label: string
  value: string | number
  tone?: 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'
}

export function QueueToolbar({
  title,
  description,
  selectedCount,
  totalCount,
  slaSummary,
  actions,
  className,
}: {
  title: string
  description?: string
  selectedCount?: number
  totalCount?: number
  slaSummary?: SlaSummary
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('action-bar', className)}>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {title}
          {typeof totalCount === 'number' ? ` (${totalCount})` : ''}
        </p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="action-bar-actions">
        {typeof selectedCount === 'number' ? (
          <StatusChip tone="info" size="compact">
            {selectedCount} selected
          </StatusChip>
        ) : null}
        {slaSummary ? (
          <StatusChip tone={slaSummary.tone || 'info'} size="compact">
            {slaSummary.label}: {slaSummary.value}
          </StatusChip>
        ) : null}
        {actions}
      </div>
    </div>
  )
}
