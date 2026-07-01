import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { DEFAULT_HISTORY_DAYS, EVENTS_STALE_TIME_MS, MAX_EVENTS } from '@shared/constants'
import type { EventsFetchResult } from '@shared/ipc'
import { client } from '../api/client'
import { useSettingsStore } from '../state/settingsStore'

export const EVENTS_QUERY_KEY = ['events'] as const

/**
 * Fetches and caches the full event set via React Query.
 *
 * A single broad query (all active events + recent history) backs every view;
 * filtering and search happen client-side against this cache for instant
 * interaction. The auto-refresh interval follows the user's setting, and React
 * Query keeps previous data visible during background refetches.
 */
export function useEvents(): UseQueryResult<EventsFetchResult> {
  const refreshMinutes = useSettingsStore((s) => s.settings.refreshIntervalMinutes)

  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () =>
      client.fetchEvents({
        status: 'all',
        days: DEFAULT_HISTORY_DAYS,
        limit: MAX_EVENTS
      }),
    staleTime: EVENTS_STALE_TIME_MS,
    refetchInterval: refreshMinutes > 0 ? refreshMinutes * 60_000 : false,
    refetchOnWindowFocus: false
  })
}
