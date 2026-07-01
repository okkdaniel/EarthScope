import { Skeleton } from '../ui/Skeleton'

/**
 * Suspense fallback shown while a lazily-loaded view chunk downloads. A quiet
 * skeleton rather than a spinner keeps transitions feeling responsive
 * (CLAUDE.md: prefer skeleton loaders).
 */
export function ViewLoader(): JSX.Element {
  return (
    <div className="h-full w-full p-8" aria-busy="true" aria-label="Loading view">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 rounded-2xl" />
    </div>
  )
}
