import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Eyebrow } from '../editorial/Eyebrow'

interface StateMessageProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Empty, error and offline states in the editorial voice: an eyebrow over a
 * serif title and a quiet explanation of why the screen is empty and what to do
 * next. No icon, no illustration.
 */
export function StateMessage({
  eyebrow = 'No data',
  title,
  description,
  action,
  className
}: StateMessageProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-3 px-10 text-center',
        className
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="display text-2xl leading-tight text-content-primary">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm leading-relaxed text-content-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
