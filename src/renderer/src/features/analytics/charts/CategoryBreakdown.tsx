import type { CategoryCount } from '@shared/services/aggregate'

/**
 * A ledger of categories by count. The proportion bar is drawn in ink on a
 * quiet track — monochrome, per the system — while the category itself is
 * identified by a single small colour dot (the one data mark).
 */
export function CategoryBreakdown({ data }: { data: CategoryCount[] }): JSX.Element {
  if (data.length === 0) {
    return <p className="py-6 text-sm text-content-secondary">No events to summarise.</p>
  }

  const max = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-3">
      {data.map((entry) => (
        <div key={entry.categoryId} className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="flex items-baseline gap-2 text-content-primary">
              <span
                className="h-2 w-2 translate-y-px rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.label}
            </span>
            <span className="tabular text-content-secondary">{entry.count}</span>
          </div>
          <div className="h-px w-full bg-surface-rule">
            <div
              className="h-px bg-content-primary transition-[width] duration-500 ease-quiet"
              style={{ width: `${(entry.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
