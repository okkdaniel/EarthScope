import { AnimatePresence } from 'framer-motion'
import { Search, SatelliteDish, CloudOff } from 'lucide-react'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { useUiStore } from '../../state/uiStore'
import { useFilterStore } from '../../state/filterStore'
import { Globe } from './globe/Globe'
import { CategoryFilter } from './CategoryFilter'
import { EventListItem } from '../events/EventListItem'
import { EventDetailPanel } from '../event-detail/EventDetailPanel'
import { StateMessage } from '../../components/common/StateMessage'
import { Skeleton } from '../../components/ui/Skeleton'

/**
 * The Explore workspace: a docked event list on the left and the globe filling
 * the remaining space, with the detail panel overlaying the globe on selection.
 * The globe is always the primary focus (CLAUDE.md: Information Hierarchy).
 */
export function ExploreView(): JSX.Element {
  const { all, filtered, isLoading, isError } = useFilteredEvents()
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const selectEvent = useUiStore((s) => s.selectEvent)
  const query = useFilterStore((s) => s.query)
  const setQuery = useFilterStore((s) => s.setQuery)

  const selectedEvent = filtered.find((e) => e.id === selectedEventId) ?? null

  return (
    <div className="flex h-full">
      <aside className="flex w-80 shrink-0 flex-col border-r border-surface-border bg-surface-raised">
        <div className="space-y-3 border-b border-surface-border p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-tertiary"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter events…"
              className="h-9 w-full rounded-lg border border-surface-border bg-surface-base pl-9 pr-3 text-sm text-content-primary placeholder:text-content-tertiary focus:border-accent/50"
            />
          </div>
          <CategoryFilter events={all} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <EventListSkeleton />
          ) : isError ? (
            <StateMessage
              icon={CloudOff}
              title="Couldn't load events"
              description="EarthScope will keep retrying. Check your connection or refresh."
            />
          ) : filtered.length === 0 ? (
            <StateMessage
              icon={SatelliteDish}
              title="No matching events"
              description="Try clearing filters or broadening your search to see more activity."
            />
          ) : (
            <div className="space-y-0.5">
              {filtered.map((event) => (
                <EventListItem
                  key={event.id}
                  event={event}
                  selected={event.id === selectedEventId}
                  onSelect={selectEvent}
                />
              ))}
            </div>
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
    <div className="space-y-1 p-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-2 py-2.5">
          <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
