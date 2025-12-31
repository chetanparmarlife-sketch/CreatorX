import { cn } from '@/lib/utils/cn'

type PanelTone = 'info' | 'warning' | 'critical'

const toneClasses: Record<PanelTone, string> = {
  info: 'context-panel context-panel-info',
  warning: 'context-panel context-panel-warning',
  critical: 'context-panel context-panel-critical',
}

export function ContextPanel({
  title,
  description,
  tone = 'info',
  children,
  className,
}: {
  title: string
  description?: string
  tone?: PanelTone
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(toneClasses[tone], className)}>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
        {description ? <p className="text-sm font-semibold text-slate-900">{description}</p> : null}
      </div>
      {children ? <div className="context-panel-body">{children}</div> : null}
    </div>
  )
}
