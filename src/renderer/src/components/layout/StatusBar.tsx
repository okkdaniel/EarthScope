import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Wifi, WifiOff, Circle } from 'lucide-react'
import { relativeTime } from '@shared/utils/time'
import { EVENTS_QUERY_KEY, useEvents } from '../../hooks/useEvents'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { cn } from '../../utils/cn'

/**
 * A quiet status strip along the bottom edge: connectivity, data freshness,
 * result counts and a manual refresh. Communicates state without competing with
 * the globe.
 */
export function StatusBar(): JSX.Element {
  const online = useOnlineStatus()
  const query = useEvents()
  const { all, filtered, fromCache, fetchedAt } = useFilteredEvents()
  const queryClient = useQueryClient()

  const activeCount = all.filter((event) => event.isActive).length
  const isRefreshing = query.isFetching

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-surface-border bg-surface-raised px-4 text-2xs text-content-tertiary">
      <span className="flex items-center gap-1.5">
        {online ? (
          <Wifi className="h-3 w-3 text-emerald-400" strokeWidth={2} />
        ) : (
          <WifiOff className="h-3 w-3 text-amber-400" strokeWidth={2} />
        )}
        {online ? 'Online' : 'Offline'}
      </span>

      <span className="flex items-center gap-1.5">
        <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
        {activeCount} active
      </span>

      <span>
        {filtered.length === all.length
          ? `${all.length} events`
          : `${filtered.length} of ${all.length} shown`}
      </span>

      <div className="ml-auto flex items-center gap-3">
        {fromCache && <span className="text-amber-400">Showing cached data</span>}
        {fetchedAt && <span>Updated {relativeTime(fetchedAt)}</span>}
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:text-content-secondary disabled:opacity-60"
          aria-label="Refresh events"
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} strokeWidth={2} />
          Refresh
        </button>
      </div>
    </footer>
  )
}
