interface StatusBadgeProps {
  status: 'active' | 'closed' | 'draft' | 'paused'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-100 text-slate-700',
    draft: 'bg-amber-100 text-amber-800',
    paused: 'bg-orange-100 text-orange-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.closed}`}>
      {status.toUpperCase()}
    </span>
  )
}

interface PillBadgeProps {
  label: string
  variant?: 'outline' | 'solid'
}

export function PillBadge({ label, variant = 'outline' }: PillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        variant === 'outline'
          ? 'border border-slate-200/70 text-slate-700 bg-white/80'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </span>
  )
}
