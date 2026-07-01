import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * A block heading inside a view: serif sub-display title over a soft hairline.
 * Replaces the old "card header" — content groups by rule, not by container.
 */
export function SectionHeading({
  children,
  aside,
  className
}: {
  children: ReactNode
  aside?: ReactNode
  className?: string
}): JSX.Element {
  return (
    <div
      className={cn(
        'mb-5 flex items-baseline justify-between gap-4 border-b border-surface-border pb-2.5',
        className
      )}
    >
      <h2 className="display text-2xl leading-none text-content-primary">{children}</h2>
      {aside && <div className="shrink-0 text-content-secondary">{aside}</div>}
    </div>
  )
}
