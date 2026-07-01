import { describe, expect, it } from 'vitest'
import {
  computeStats,
  countByCategory,
  dedupeEvents,
  eventsOverTime
} from './aggregate'
import type { NaturalEvent } from '../models/event'
import type { EventCategoryId } from '../models/category'

function makeEvent(overrides: Partial<NaturalEvent> & { id: string }): NaturalEvent {
  const categoryId = (overrides.categoryId ?? 'wildfires') as EventCategoryId
  return {
    id: overrides.id,
    title: overrides.title ?? `Event ${overrides.id}`,
    description: null,
    link: null,
    categoryId,
    categoryIds: [categoryId],
    closed: overrides.closed ?? null,
    isActive: overrides.closed ? false : (overrides.isActive ?? true),
    sources: [],
    geometries: [
      {
        date: overrides.firstDetected ?? '2026-06-01T00:00:00Z',
        type: 'Point',
        point: overrides.position ?? { latitude: 0, longitude: 0 }
      }
    ],
    firstDetected: overrides.firstDetected ?? '2026-06-01T00:00:00Z',
    latestUpdate: overrides.latestUpdate ?? '2026-06-02T00:00:00Z',
    position: overrides.position ?? { latitude: 0, longitude: 0 },
    providerId: 'test'
  }
}

describe('dedupeEvents', () => {
  it('keeps the most recently updated copy of a duplicate id', () => {
    const a = makeEvent({ id: 'x', latestUpdate: '2026-06-01T00:00:00Z' })
    const b = makeEvent({ id: 'x', latestUpdate: '2026-06-05T00:00:00Z' })
    const result = dedupeEvents([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].latestUpdate).toBe('2026-06-05T00:00:00Z')
  })
})

describe('countByCategory', () => {
  it('counts and sorts categories descending', () => {
    const events = [
      makeEvent({ id: '1', categoryId: 'wildfires' }),
      makeEvent({ id: '2', categoryId: 'wildfires' }),
      makeEvent({ id: '3', categoryId: 'floods' })
    ]
    const counts = countByCategory(events)
    expect(counts[0]).toMatchObject({ categoryId: 'wildfires', count: 2 })
    expect(counts[1]).toMatchObject({ categoryId: 'floods', count: 1 })
  })
})

describe('eventsOverTime', () => {
  it('produces a continuous, gap-filled series', () => {
    const now = Date.UTC(2026, 5, 30)
    const events = [
      makeEvent({ id: '1', firstDetected: '2026-06-30T00:00:00Z' }),
      makeEvent({ id: '2', firstDetected: '2026-06-30T05:00:00Z' })
    ]
    const buckets = eventsOverTime(events, 7, now)
    expect(buckets).toHaveLength(7)
    expect(buckets[buckets.length - 1].count).toBe(2)
    expect(buckets[0].count).toBe(0)
  })
})

describe('computeStats', () => {
  it('summarises active/closed counts and average duration', () => {
    const now = Date.UTC(2026, 5, 10)
    const events = [
      makeEvent({ id: '1', firstDetected: '2026-06-01T00:00:00Z' }),
      makeEvent({
        id: '2',
        firstDetected: '2026-06-01T00:00:00Z',
        closed: '2026-06-03T00:00:00Z'
      })
    ]
    const stats = computeStats(events, now)
    expect(stats.total).toBe(2)
    expect(stats.active).toBe(1)
    expect(stats.closed).toBe(1)
    expect(stats.averageDurationMs).toBeGreaterThan(0)
    expect(stats.recentlyClosed).toHaveLength(1)
  })
})
