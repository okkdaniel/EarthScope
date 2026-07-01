import { describe, expect, it } from 'vitest'
import { clusterScreenPoints, type ScreenPoint } from './cluster'

describe('clusterScreenPoints', () => {
  it('merges nearby same-category points into one cluster', () => {
    const points: ScreenPoint[] = [
      { id: 'a', x: 100, y: 100, categoryId: 'wildfires' },
      { id: 'b', x: 108, y: 104, categoryId: 'wildfires' },
      { id: 'c', x: 112, y: 98, categoryId: 'wildfires' }
    ]
    const clusters = clusterScreenPoints(points, 30)
    expect(clusters).toHaveLength(1)
    expect(clusters[0].memberIds.sort()).toEqual(['a', 'b', 'c'])
  })

  it('does not merge points of different categories even when overlapping', () => {
    const points: ScreenPoint[] = [
      { id: 'fire', x: 100, y: 100, categoryId: 'wildfires' },
      { id: 'flood', x: 101, y: 101, categoryId: 'floods' }
    ]
    const clusters = clusterScreenPoints(points, 30)
    expect(clusters).toHaveLength(2)
  })

  it('keeps distant points separate', () => {
    const points: ScreenPoint[] = [
      { id: 'a', x: 0, y: 0, categoryId: 'wildfires' },
      { id: 'b', x: 500, y: 500, categoryId: 'wildfires' }
    ]
    const clusters = clusterScreenPoints(points, 30)
    expect(clusters).toHaveLength(2)
  })

  it('reports the centroid of clustered members', () => {
    const points: ScreenPoint[] = [
      { id: 'a', x: 100, y: 100, categoryId: 'floods' },
      { id: 'b', x: 120, y: 140, categoryId: 'floods' }
    ]
    const [cluster] = clusterScreenPoints(points, 60)
    expect(cluster.x).toBeCloseTo(110)
    expect(cluster.y).toBeCloseTo(120)
  })

  it('returns an empty array for no points', () => {
    expect(clusterScreenPoints([], 30)).toEqual([])
  })
})
