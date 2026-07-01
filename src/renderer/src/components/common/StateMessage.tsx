import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface StateMessageProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * A shared component for empty, error and offline states. Every empty screen
 * explains why it's empty and what to do next (CLAUDE.md: Empty States).
 */
export function StateMessage({
  icon: Icon,
  title,
  description,
  action,
  className
}: StateMessageProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-3 px-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
        <Icon className="h-5 w-5 text-content-tertiary" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-content-primary">{title}</h3>
        {description && (
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-content-secondary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
