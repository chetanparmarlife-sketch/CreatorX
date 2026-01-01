interface StatusBadgeProps {
  status: 'active' | 'closed' | 'draft' | 'paused'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500 text-white',
    closed: 'bg-slate-100 text-slate-700',
    draft: 'bg-amber-500 text-white',
    paused: 'bg-orange-500 text-white',
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
          ? 'border border-slate-200 text-slate-700 bg-white'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </span>
  )
}
