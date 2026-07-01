import { cn } from '../../utils/cn'

/** A calm shimmer placeholder used for loading states (never a spinner). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-hover/60', className)}
      aria-hidden="true"
    />
  )
}
