import { AnimatePresence } from 'framer-motion'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { useUiStore, selectDetailVisible } from '../../state/uiStore'
import { useFilterStore } from '../../state/filterStore'
import { Globe } from './globe/Globe'
import { CategoryFilter } from './CategoryFilter'
import { EventGroupList } from './EventGroupList'
import { EventDetailPanel } from '../event-detail/EventDetailPanel'
import { StateMessage } from '../../components/common/StateMessage'
import { Skeleton } from '../../components/ui/Skeleton'
import { Eyebrow } from '../../components/editorial/Eyebrow'

/**
 * The Explore workspace: a docked event index on the left, the globe filling
 * the rest, and the detail panel overlaying a corner of the globe on selection.
 * The globe is always the primary focus.
 */
export function ExploreView(): JSX.Element {
  const { all, filtered, isLoading, isError } = useFilteredEvents()
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const selectEvent = useUiStore((s) => s.selectEvent)
  const detailVisible = useUiStore(selectDetailVisible)
  const query = useFilterStore((s) => s.query)
  const setQuery = useFilterStore((s) => s.setQuery)

  const selectedEvent = detailVisible
    ? (filtered.find((e) => e.id === selectedEventId) ?? null)
    : null

  return (
    <div className="flex h-full">
      <aside className="flex w-80 shrink-0 flex-col border-r border-surface-border">
        <div className="space-y-5 border-b border-surface-border px-6 pb-5 pt-6">
          <Eyebrow>Event index</Eyebrow>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter events…"
            className="w-full border-b border-content-primary bg-transparent pb-1.5 text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />
          <CategoryFilter events={all} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <EventListSkeleton />
          ) : isError ? (
            <StateMessage
              eyebrow="Offline"
              title="Couldn't load events"
              description="EarthScope will keep retrying. Check your connection or refresh."
            />
          ) : filtered.length === 0 ? (
            <StateMessage
              eyebrow="No results"
              title="No matching events"
              description="Clear filters or broaden your search to see more activity."
            />
          ) : (
            <EventGroupList events={filtered} selectedId={selectedEventId} onSelect={selectEvent} />
          )}
        </div>
      </aside>

      <div className="relative min-w-0 flex-1">
        <Globe events={filtered} />
        <AnimatePresence>
          {selectedEvent && <EventDetailPanel key={selectedEvent.id} event={selectedEvent} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EventListSkeleton(): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 border-b border-surface-border pb-2.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  )
}
