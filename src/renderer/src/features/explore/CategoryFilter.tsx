import { useMemo } from 'react'
import { CATEGORY_LIST } from '@shared/models/category'
import type { NaturalEvent } from '@shared/models/event'
import { useFilterStore } from '../../state/filterStore'
import { cn } from '../../utils/cn'

/**
 * Category filters as uppercase tracked toggles — no pills, no chip fills. The
 * active category is marked by ink weight and an underline; a small colour dot
 * carries the category (the one data mark). Selecting none shows everything.
 */
export function CategoryFilter({ events }: { events: NaturalEvent[] }): JSX.Element {
  const selected = useFilterStore((s) => s.categories)
  const toggle = useFilterStore((s) => s.toggleCategory)
  const clear = useFilterStore((s) => s.clearCategories)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) {
      for (const id of event.categoryIds) map.set(id, (map.get(id) ?? 0) + 1)
    }
    return map
  }, [events])

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-2xs uppercase tracking-meta">
      <button
        type="button"
        onClick={clear}
        className={cn(
          'hover-fade',
          selected.size === 0
            ? 'border-b border-content-primary pb-0.5 text-content-primary'
            : 'text-content-secondary'
        )}
      >
        All
      </button>
      {CATEGORY_LIST.map((category) => {
        const count = counts.get(category.id) ?? 0
        if (count === 0) return null
        const isActive = selected.has(category.id)
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => toggle(category.id)}
            className={cn(
              'inline-flex items-baseline gap-1.5 hover-fade',
              isActive
                ? 'border-b border-content-primary pb-0.5 text-content-primary'
                : 'text-content-secondary'
            )}
          >
            <span
              className="h-1.5 w-1.5 translate-y-px rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            {category.label}
            <span className="tabular text-content-tertiary">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
