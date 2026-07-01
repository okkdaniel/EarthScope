import { describe, expect, it } from 'vitest'
import { filterEvents, rankEvents, EMPTY_FILTER } from './search'
import type { NaturalEvent } from '../models/event'
import type { EventCategoryId } from '../models/category'

function makeEvent(id: string, title: string, categoryId: EventCategoryId, active = true): NaturalEvent {
  return {
    id,
    title,
    description: null,
    link: null,
    categoryId,
    categoryIds: [categoryId],
    closed: active ? null : '2026-06-01T00:00:00Z',
    isActive: active,
    sources: [],
    geometries: [{ date: '2026-06-01T00:00:00Z', type: 'Point', point: { latitude: 0, longitude: 0 } }],
    firstDetected: '2026-06-01T00:00:00Z',
    latestUpdate: '2026-06-02T00:00:00Z',
    position: { latitude: 0, longitude: 0 },
    providerId: 'test'
  }
}

const events = [
  makeEvent('1', 'California Wildfire', 'wildfires'),
  makeEvent('2', 'Iceland Volcano', 'volcanoes'),
  makeEvent('3', 'Old Flood', 'floods', false)
]

describe('filterEvents', () => {
  it('returns everything with an empty filter', () => {
    expect(filterEvents(events, EMPTY_FILTER)).toHaveLength(3)
  })

  it('filters by category (OR across selected)', () => {
    const result = filterEvents(events, {
      ...EMPTY_FILTER,
      categories: new Set<EventCategoryId>(['wildfires', 'volcanoes'])
    })
    expect(result.map((e) => e.id)).toEqual(['1', '2'])
  })

  it('filters by active status', () => {
    const result = filterEvents(events, { ...EMPTY_FILTER, activeOnly: true })
    expect(result.map((e) => e.id)).toEqual(['1', '2'])
  })

  it('matches free-text against the title', () => {
    const result = filterEvents(events, { ...EMPTY_FILTER, query: 'volcano' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })
})

describe('rankEvents', () => {
  it('ranks exact and prefix matches above substring matches', () => {
    const list = [
      makeEvent('a', 'Fire Complex', 'wildfires'),
      makeEvent('b', 'California Fire', 'wildfires')
    ]
    const ranked = rankEvents(list, 'fire')
    expect(ranked[0].id).toBe('a') // prefix match ranks first
  })

  it('returns recent events when the query is empty', () => {
    const ranked = rankEvents(events, '')
    expect(ranked).toHaveLength(3)
  })
})
