import { useMemo } from 'react'
import type { NaturalEvent } from '@shared/models/event'
import { filterEvents, type EventFilter } from '@shared/services/search'
import { useEvents } from './useEvents'
import { useFilterStore } from '../state/filterStore'

export interface FilteredEventsResult {
  /** All events returned by the provider(s). */
  all: NaturalEvent[]
  /** Events after applying the active filter. */
  filtered: NaturalEvent[]
  isLoading: boolean
  isError: boolean
  fromCache: boolean
  fetchedAt: string | null
}

/**
 * Combines the cached event set with the current filter. The filtering itself
 * is a pure function memoised on its inputs, so scrubbing filters never
 * triggers a network request and stays at interactive speed.
 */
export function useFilteredEvents(): FilteredEventsResult {
  const query = useEvents()
  const categories = useFilterStore((s) => s.categories)
  const text = useFilterStore((s) => s.query)
  const activeOnly = useFilterStore((s) => s.activeOnly)

  const all = query.data?.events ?? EMPTY

  const filtered = useMemo(() => {
    const filter: EventFilter = { categories, query: text, activeOnly }
    return filterEvents(all, filter)
  }, [all, categories, text, activeOnly])

  return {
    all,
    filtered,
    isLoading: query.isLoading,
    isError: query.isError || Boolean(query.data?.error && query.data.events.length === 0),
    fromCache: query.data?.fromCache ?? false,
    fetchedAt: query.data?.fetchedAt ?? null
  }
}

const EMPTY: NaturalEvent[] = []
