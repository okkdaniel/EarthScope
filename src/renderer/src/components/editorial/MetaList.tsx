import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * MetaList — metadata fragments joined by spaced middle-dots ( · ), the only
 * allowed separator. Rendered in quiet secondary ink; numbers are tabular.
 */
export function MetaList({
  items,
  className
}: {
  items: ReactNode[]
  className?: string
}): JSX.Element {
  const visible = items.filter((item) => item !== null && item !== undefined && item !== '')
  return (
    <div className={cn('tabular flex flex-wrap items-baseline text-content-secondary', className)}>
      {visible.map((item, index) => (
        <span key={index} className="inline-flex items-baseline">
          {index > 0 && (
            <span aria-hidden className="mx-2 text-content-tertiary">
              ·
            </span>
          )}
          {item}
        </span>
      ))}
    </div>
  )
}
