import { memo } from 'react'
import { Star } from 'lucide-react'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { relativeTime } from '@shared/utils/time'
import { formatCoordinates } from '@shared/utils/geo'
import { CategoryDot } from '../../components/common/CategoryDot'
import { useBookmarkStore } from '../../state/bookmarkStore'
import { cn } from '../../utils/cn'

interface EventListItemProps {
  event: NaturalEvent
  selected?: boolean
  onSelect: (id: string) => void
}

/**
 * A single compact event row. Used in the explorer list and the dashboard.
 * Memoised because these render in long lists that update on every refetch.
 */
export const EventListItem = memo(function EventListItem({
  event,
  selected = false,
  onSelect
}: EventListItemProps): JSX.Element {
  const meta = resolveCategoryMeta(event.categoryId)
  const bookmarked = useBookmarkStore((s) => s.ids.includes(event.id))
  const toggleBookmark = useBookmarkStore((s) => s.toggle)

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      data-active={selected}
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left',
        'transition-colors duration-150 ease-out-soft hover:bg-surface-hover',
        'data-[active=true]:bg-surface-hover'
      )}
    >
      <CategoryDot categoryId={event.categoryId} size={9} className="mt-1.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-content-primary">{event.title}</p>
          {event.isActive && (
            <span className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-2xs font-medium text-emerald-300">
              Active
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-content-tertiary">
          {meta.label} · {formatCoordinates(event.position)}
        </p>
        <p className="mt-0.5 text-2xs text-content-tertiary">
          Updated {relativeTime(event.latestUpdate)}
        </p>
      </div>
      <span
        role="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation()
          toggleBookmark(event.id)
        }}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        className={cn(
          'mt-0.5 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100',
          bookmarked && 'opacity-100'
        )}
      >
        <Star
          className={cn('h-3.5 w-3.5', bookmarked ? 'fill-amber-400 text-amber-400' : 'text-content-tertiary')}
          strokeWidth={1.75}
        />
      </span>
    </button>
  )
})
