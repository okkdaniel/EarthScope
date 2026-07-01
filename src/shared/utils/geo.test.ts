import { describe, expect, it } from 'vitest'
import { centroidOf, continentOf, formatCoordinates, haversineKm, latLngToVector3 } from './geo'

describe('haversineKm', () => {
  it('returns ~0 for identical points', () => {
    expect(haversineKm({ latitude: 10, longitude: 20 }, { latitude: 10, longitude: 20 })).toBeCloseTo(0)
  })

  it('approximates a known distance (London ↔ Paris ≈ 344 km)', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 }
    const paris = { latitude: 48.8566, longitude: 2.3522 }
    expect(haversineKm(london, paris)).toBeGreaterThan(330)
    expect(haversineKm(london, paris)).toBeLessThan(360)
  })
})

describe('centroidOf', () => {
  it('averages a ring of coordinates', () => {
    const centroid = centroidOf([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10]
    ])
    expect(centroid).toEqual({ latitude: 5, longitude: 5 })
  })

  it('handles an empty ring safely', () => {
    expect(centroidOf([])).toEqual({ latitude: 0, longitude: 0 })
  })
})

describe('latLngToVector3', () => {
  it('places the equator/prime-meridian point on the +? axis consistently', () => {
    const [x, y, z] = latLngToVector3(0, 0, 1)
    expect(Math.hypot(x, y, z)).toBeCloseTo(1)
    expect(y).toBeCloseTo(0)
  })
})

describe('continentOf', () => {
  it('classifies representative points', () => {
    expect(continentOf({ latitude: 40, longitude: -100 })).toBe('North America')
    expect(continentOf({ latitude: 48.85, longitude: 2.35 })).toBe('Europe')
  })
})

describe('formatCoordinates', () => {
  it('formats with hemisphere suffixes', () => {
    expect(formatCoordinates({ latitude: 34.05, longitude: -118.24 })).toBe('34.05°N, 118.24°W')
    expect(formatCoordinates({ latitude: -33.87, longitude: 151.21 })).toBe('33.87°S, 151.21°E')
  })
})
