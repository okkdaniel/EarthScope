import { useMemo } from 'react'
import type { NaturalEvent } from '@shared/models/event'
import { useEvents } from './useEvents'

/** Look up a single event from the cached set by id. */
export function useEventById(id: string | null): NaturalEvent | null {
  const query = useEvents()
  return useMemo(() => {
    if (!id) return null
    return query.data?.events.find((event) => event.id === id) ?? null
  }, [id, query.data])
}
