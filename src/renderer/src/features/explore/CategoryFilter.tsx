import { CATEGORY_LIST } from '@shared/models/category'
import type { NaturalEvent } from '@shared/models/event'
import { useMemo } from 'react'
import { useFilterStore } from '../../state/filterStore'
import { cn } from '../../utils/cn'

/**
 * Category toggles. Selecting none means "show everything" — a common, forgiving
 * default. Each chip shows the live count so users understand the data at a
 * glance. Multiple categories combine (OR) as required by the spec.
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
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={clear}
        data-active={selected.size === 0}
        className={cn(
          'rounded-full border border-surface-border px-2.5 py-1 text-2xs font-medium',
          'text-content-secondary transition-colors hover:border-surface-hover',
          'data-[active=true]:border-accent/50 data-[active=true]:bg-accent-soft data-[active=true]:text-content-primary'
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
            data-active={isActive}
            className={cn(
              'flex items-center gap-1.5 rounded-full border border-surface-border px-2.5 py-1',
              'text-2xs font-medium text-content-secondary transition-colors hover:border-surface-hover',
              'data-[active=true]:text-content-primary'
            )}
            style={
              isActive
                ? { borderColor: `${category.color}80`, backgroundColor: `${category.color}1f` }
                : undefined
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            {category.label}
            <span className="text-content-tertiary">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
