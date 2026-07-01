import { describe, expect, it } from 'vitest'
import { mapEonetEvent } from './eonet.mapper'
import type { EonetEvent } from './eonet.types'

const baseEvent: EonetEvent = {
  id: 'EONET_1',
  title: 'Test Wildfire',
  description: 'A test fire',
  link: 'https://example.com/1',
  closed: null,
  categories: [{ id: 'wildfires', title: 'Wildfires' }],
  sources: [{ id: 'InciWeb', url: 'https://example.com/src' }],
  geometry: [
    { date: '2026-06-01T00:00:00Z', type: 'Point', coordinates: [-120.5, 38.2] },
    { date: '2026-06-03T00:00:00Z', type: 'Point', coordinates: [-120.6, 38.3] }
  ]
}

describe('mapEonetEvent', () => {
  it('maps a well-formed event to the domain model', () => {
    const result = mapEonetEvent(baseEvent)
    expect(result).not.toBeNull()
    expect(result?.categoryId).toBe('wildfires')
    expect(result?.isActive).toBe(true)
    expect(result?.geometries).toHaveLength(2)
    expect(result?.position).toEqual({ latitude: 38.3, longitude: -120.6 })
  })

  it('orders geometries chronologically and derives first/latest', () => {
    const shuffled: EonetEvent = {
      ...baseEvent,
      geometry: [
        { date: '2026-06-05T00:00:00Z', type: 'Point', coordinates: [1, 1] },
        { date: '2026-06-01T00:00:00Z', type: 'Point', coordinates: [0, 0] }
      ]
    }
    const result = mapEonetEvent(shuffled)
    expect(result?.firstDetected).toBe('2026-06-01T00:00:00Z')
    expect(result?.latestUpdate).toBe('2026-06-05T00:00:00Z')
  })

  it('marks events with a close date as inactive', () => {
    const result = mapEonetEvent({ ...baseEvent, closed: '2026-06-10T00:00:00Z' })
    expect(result?.isActive).toBe(false)
    expect(result?.closed).toBe('2026-06-10T00:00:00Z')
  })

  it('returns null when there is no valid geometry', () => {
    expect(mapEonetEvent({ ...baseEvent, geometry: [] })).toBeNull()
  })

  it('returns null when no known category is present', () => {
    const result = mapEonetEvent({ ...baseEvent, categories: [{ id: 'unknownCategory' }] })
    expect(result).toBeNull()
  })

  it('computes a centroid for polygon geometries', () => {
    const polygon: EonetEvent = {
      ...baseEvent,
      geometry: [
        {
          date: '2026-06-01T00:00:00Z',
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10]
            ]
          ]
        }
      ]
    }
    const result = mapEonetEvent(polygon)
    expect(result?.position.latitude).toBeCloseTo(5)
    expect(result?.position.longitude).toBeCloseTo(5)
  })

  it('discards geometry with malformed coordinates but keeps valid ones', () => {
    const messy: EonetEvent = {
      ...baseEvent,
      geometry: [
        { date: '2026-06-01T00:00:00Z', type: 'Point', coordinates: 'nonsense' },
        { date: '2026-06-02T00:00:00Z', type: 'Point', coordinates: [5, 5] }
      ]
    }
    const result = mapEonetEvent(messy)
    expect(result?.geometries).toHaveLength(1)
    expect(result?.position).toEqual({ latitude: 5, longitude: 5 })
  })
})
