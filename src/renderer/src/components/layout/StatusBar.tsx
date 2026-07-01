import { useQueryClient } from '@tanstack/react-query'
import { relativeTime } from '@shared/utils/time'
import { EVENTS_QUERY_KEY, useEvents } from '../../hooks/useEvents'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { EditorialLink } from '../editorial/EditorialLink'

/**
 * A quiet status strip along the bottom edge: connectivity, freshness, counts
 * and a manual refresh — set as uppercase tracked metadata joined by middle
 * dots. No icons, no colour; it never competes with the globe.
 */
export function StatusBar(): JSX.Element {
  const online = useOnlineStatus()
  const query = useEvents()
  const { all, filtered, fromCache, fetchedAt } = useFilteredEvents()
  const queryClient = useQueryClient()

  const activeCount = all.filter((event) => event.isActive).length
  const isRefreshing = query.isFetching

  const shown =
    filtered.length === all.length ? `${all.length} events` : `${filtered.length} of ${all.length}`

  return (
    <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-surface-border px-10 text-2xs tracking-meta text-content-secondary">
      <span className="uppercase">{online ? 'Online' : 'Offline'}</span>
      <Dot />
      <span className="tabular uppercase">{activeCount} active</span>
      <Dot />
      <span className="tabular uppercase">{shown}</span>

      <div className="ml-auto flex items-center gap-3 uppercase">
        {fromCache && <span className="text-content-tertiary">Cached data</span>}
        {fetchedAt && !fromCache && <span className="tabular">Updated {relativeTime(fetchedAt)}</span>}
        {fetchedAt && fromCache && <Dot />}
        <EditorialLink
          as="button"
          underline={false}
          quiet
          arrow
          onClick={() => queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })}
          disabled={isRefreshing}
          className="tracking-meta uppercase disabled:opacity-40"
        >
          {isRefreshing ? 'Refreshing' : 'Refresh'}
        </EditorialLink>
      </div>
    </footer>
  )
}

function Dot(): JSX.Element {
  return (
    <span aria-hidden className="text-content-tertiary">
      ·
    </span>
  )
}
