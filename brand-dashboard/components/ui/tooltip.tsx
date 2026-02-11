'use client'

import * as React from 'react'

// Simple tooltip implementation without external dependencies
const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
}

const Tooltip = ({ children }: TooltipProps) => {
  return <div className="relative inline-block">{children}</div>
}

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} className="group" {...props}>
      {children}
    </div>
  )
})
TooltipTrigger.displayName = 'TooltipTrigger'

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, side = 'top', ...props }, ref) => {
    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    }

    return (
      <div
        ref={ref}
        className={`absolute z-50 hidden group-hover:block ${positionClasses[side]}`}
        {...props}
      >
        <div
          className={`overflow-hidden rounded-md border bg-slate-900 px-3 py-1.5 text-sm text-white shadow-md ${className || ''}`}
        >
          {children}
        </div>
      </div>
    )
  }
)
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
