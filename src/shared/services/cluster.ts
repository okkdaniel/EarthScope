/**
 * Pure screen-space clustering.
 *
 * Groups markers that land close together on screen *and* share a category, so
 * overlapping events collapse into a single, countable cluster. Working in
 * screen space (rather than fixed geographic distance) makes clustering
 * zoom-aware for free: as the user zooms in, points spread apart on screen and
 * clusters naturally break into their members — the behaviour users expect from
 * map software. Kept UI-free so it is unit-testable in isolation.
 */

export interface ScreenPoint {
  readonly id: string
  /** Screen-space pixel coordinates. */
  readonly x: number
  readonly y: number
  readonly categoryId: string
}

export interface ScreenCluster {
  readonly categoryId: string
  readonly memberIds: string[]
  /** Centroid of the cluster in screen space. */
  readonly x: number
  readonly y: number
}

/**
 * Greedily group points within `thresholdPx` of an existing same-category
 * cluster's running centroid. Deterministic for a given input order; callers
 * that need stable output across frames should pass points in a stable order.
 */
interface MutableCluster {
  categoryId: string
  memberIds: string[]
  x: number
  y: number
  sumX: number
  sumY: number
}

export function clusterScreenPoints(
  points: readonly ScreenPoint[],
  thresholdPx: number
): ScreenCluster[] {
  const clusters: MutableCluster[] = []
  const thresholdSq = thresholdPx * thresholdPx

  for (const point of points) {
    let target: MutableCluster | null = null
    let bestDistSq = thresholdSq

    for (const cluster of clusters) {
      if (cluster.categoryId !== point.categoryId) continue
      const dx = cluster.x - point.x
      const dy = cluster.y - point.y
      const distSq = dx * dx + dy * dy
      if (distSq <= bestDistSq) {
        bestDistSq = distSq
        target = cluster
      }
    }

    if (target) {
      target.memberIds.push(point.id)
      target.sumX += point.x
      target.sumY += point.y
      target.x = target.sumX / target.memberIds.length
      target.y = target.sumY / target.memberIds.length
    } else {
      clusters.push({
        categoryId: point.categoryId,
        memberIds: [point.id],
        x: point.x,
        y: point.y,
        sumX: point.x,
        sumY: point.y
      })
    }
  }

  // Strip the internal running-sum bookkeeping from the public result.
  return clusters.map(({ sumX: _sumX, sumY: _sumY, ...cluster }) => cluster)
}
