import { memo } from 'react'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { relativeTime } from '@shared/utils/time'
import { formatCoordinates } from '@shared/utils/geo'
import { CategoryDot } from '../../components/common/CategoryDot'
import { MetaList } from '../../components/editorial/MetaList'
import { cn } from '../../utils/cn'

interface EventListItemProps {
  event: NaturalEvent
  selected?: boolean
  onSelect: (id: string) => void
}

/**
 * A single event row — no card, no fill. Rows separate by soft hairline; the
 * selected row is marked by a short ink rule at its left edge. Category colour
 * is the one data mark. Memoised for long, frequently-refetched lists.
 */
export const EventListItem = memo(function EventListItem({
  event,
  selected = false,
  onSelect
}: EventListItemProps): JSX.Element {
  const meta = resolveCategoryMeta(event.categoryId)

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      data-active={selected}
      className="group relative block w-full border-b border-surface-border py-2.5 pl-4 pr-1 text-left"
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1/2 h-6 w-px -translate-y-1/2 bg-content-primary transition-opacity duration-200',
          selected ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn(
            'truncate text-sm transition-opacity duration-200',
            selected
              ? 'text-content-primary'
              : 'text-content-primary group-hover:opacity-55'
          )}
        >
          {event.title}
        </span>
        {event.isActive && (
          <span className="shrink-0 text-[10px] uppercase tracking-meta text-content-tertiary">
            Active
          </span>
        )}
      </div>
      <MetaList
        className="mt-1 text-2xs"
        items={[
          <span key="cat" className="inline-flex items-baseline gap-1.5">
            <CategoryDot categoryId={event.categoryId} size={6} />
            {meta.label}
          </span>,
          formatCoordinates(event.position),
          relativeTime(event.latestUpdate)
        ]}
      />
    </button>
  )
})
