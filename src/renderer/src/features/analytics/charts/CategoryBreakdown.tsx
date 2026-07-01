import type { CategoryCount } from '@shared/services/aggregate'

/**
 * A minimal horizontal bar breakdown. Rendered without a charting library — for
 * a simple proportional list, plain bars are calmer, lighter and pixel-crisp.
 */
export function CategoryBreakdown({ data }: { data: CategoryCount[] }): JSX.Element {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-content-tertiary">No events to summarise.</p>
  }

  const max = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-2.5">
      {data.map((entry) => (
        <div key={entry.categoryId} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-content-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.label}
            </span>
            <span className="tabular-nums text-content-tertiary">{entry.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out-soft"
              style={{ width: `${(entry.count / max) * 100}%`, backgroundColor: entry.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
