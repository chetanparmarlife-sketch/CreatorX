import { cn } from '@/lib/utils/cn'

type StatusTone = 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'
type StatusSize = 'compact' | 'comfortable'

const toneClasses: Record<StatusTone, string> = {
  approved: 'status-chip status-chip-approved',
  needs_action: 'status-chip status-chip-needs-action',
  blocked: 'status-chip status-chip-blocked',
  pending: 'status-chip status-chip-pending',
  info: 'status-chip status-chip-info',
}

const sizeClasses: Record<StatusSize, string> = {
  compact: 'status-chip-compact',
  comfortable: 'status-chip-comfortable',
}

export function StatusChip({
  tone = 'pending',
  size = 'comfortable',
  className,
  children,
}: {
  tone?: StatusTone
  size?: StatusSize
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn(toneClasses[tone], sizeClasses[size], className)}>
      {children}
    </span>
  )
}
