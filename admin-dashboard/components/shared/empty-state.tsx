import { cn } from '@/lib/utils/cn'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('empty-state', className)}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
