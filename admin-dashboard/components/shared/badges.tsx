interface StatusBadgeProps {
  status: 'active' | 'closed' | 'draft' | 'paused'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-700',
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
          ? 'border border-gray-300 text-gray-700 bg-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {label}
    </span>
  )
}
