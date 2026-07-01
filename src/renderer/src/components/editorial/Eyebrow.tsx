import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * Eyebrow — an uppercase, tracked label (Inter, 12px, 0.16em). The system's
 * standard way to title a section or tag a category. Never a capsule or chip.
 */
export function Eyebrow({
  children,
  className,
  as: As = 'div'
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'span' | 'h2' | 'h3'
}): JSX.Element {
  return <As className={cn('eyebrow', className)}>{children}</As>
}
