import { cn } from '@/lib/utils/cn'

export function ActionBar({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('action-bar', className)}>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      {children ? <div className="action-bar-actions">{children}</div> : null}
    </div>
  )
}
