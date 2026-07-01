import { useMemo } from 'react'
import { computeStats, type EventStats } from '@shared/services/aggregate'
import { useFilteredEvents } from './useFilteredEvents'

/** Memoised analytics over the currently filtered event set. */
export function useEventStats(): { stats: EventStats; isLoading: boolean } {
  const { filtered, isLoading } = useFilteredEvents()
  const stats = useMemo(() => computeStats(filtered), [filtered])
  return { stats, isLoading }
}
