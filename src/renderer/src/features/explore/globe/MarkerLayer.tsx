import { useCallback, useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3, type Camera } from 'three'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { latLngToVector3 } from '@shared/utils/geo'
import { clusterScreenPoints, type ScreenPoint } from '@shared/services/cluster'
import { EventMarkers } from './EventMarkers'
import { ClusterMarkers, type GlobeCluster } from './ClusterMarkers'
import {
  CAMERA_MIN_DISTANCE,
  CLUSTER_THRESHOLD_PX,
  MARKER_RADIUS
} from './globeConstants'
import { useUiStore } from '../../../state/uiStore'

interface MarkerLayerProps {
  events: NaturalEvent[]
  onSelect: (id: string) => void
}

/** Fraction of the current distance to zoom to when a cluster is tapped. */
const CLUSTER_ZOOM_FACTOR = 0.55

/** The subset of the OrbitControls event API we depend on. */
interface EventTargetLike {
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

const FRONT_FACING_THRESHOLD = 0.12

/**
 * Splits the visible events into clusters and singletons and renders each with
 * the right primitive: singletons stay in the fast animated point cloud, while
 * overlapping same-category events collapse into a counted cluster badge.
 *
 * Clustering is screen-space and therefore view-dependent, so it is recomputed
 * only when the camera settles (controls "end") or the selection changes — not
 * every frame — which keeps it stable and cheap. Marker positions themselves are
 * fixed in 3D, so they track the globe correctly during rotation regardless.
 */
export function MarkerLayer({ events, onSelect }: MarkerLayerProps): JSX.Element {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const controls = useThree((s) => s.controls) as EventTargetLike | null
  const flyToLocation = useUiStore((s) => s.flyToLocation)

  const [hovered, setHovered] = useState<NaturalEvent | null>(null)
  const [version, setVersion] = useState(0)

  // Zoom toward a tapped cluster; as points spread on screen it declusters.
  const handleClusterClick = useCallback(
    (cluster: GlobeCluster): void => {
      const distance = Math.max(
        CAMERA_MIN_DISTANCE,
        camera.position.length() * CLUSTER_ZOOM_FACTOR
      )
      flyToLocation({ ...cluster.centroid, distance })
    },
    [camera, flyToLocation]
  )

  // Recompute when the camera stops moving.
  useEffect(() => {
    if (!controls) return
    const bump = (): void => setVersion((v) => v + 1)
    controls.addEventListener('end', bump)
    return () => controls.removeEventListener('end', bump)
  }, [controls])

  // Recompute when a fly-to settles or the selection changes.
  const focusEventId = useUiStore((s) => s.focusEventId)
  const focusLocation = useUiStore((s) => s.focusLocation)
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  useEffect(() => setVersion((v) => v + 1), [focusEventId, focusLocation, selectedEventId])

  const { singletons, clusters } = useMemo(
    () => partitionEvents(events, camera, size.width, size.height),
    // `camera` is a stable mutable ref; `version` forces recompute at the right moments.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, size.width, size.height, version]
  )

  const hoverPosition = useMemo(() => {
    if (!hovered) return null
    return new Vector3(
      ...latLngToVector3(hovered.position.latitude, hovered.position.longitude, MARKER_RADIUS)
    )
  }, [hovered])

  return (
    <group>
      <EventMarkers events={singletons} onSelect={onSelect} onHover={setHovered} />
      <ClusterMarkers clusters={clusters} onClusterClick={handleClusterClick} />

      {hovered && hoverPosition && (
        <group position={hoverPosition}>
          <Html center distanceFactor={undefined} zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
            <div className="-translate-y-6 whitespace-nowrap rounded-md border border-surface-border bg-surface-overlay/95 px-2 py-1 text-2xs text-content-primary">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: resolveCategoryMeta(hovered.categoryId).color }}
                />
                {hovered.title}
              </span>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

const _v = new Vector3()

/** Project events to screen, cluster the front-facing ones, and split the result. */
function partitionEvents(
  events: NaturalEvent[],
  camera: Camera,
  width: number,
  height: number
): { singletons: NaturalEvent[]; clusters: GlobeCluster[] } {
  const byId = new Map<string, NaturalEvent>()
  const camDir = camera.position.clone().normalize()
  const screenPoints: ScreenPoint[] = []
  const backFacing: NaturalEvent[] = []

  for (const event of events) {
    byId.set(event.id, event)
    const [x, y, z] = latLngToVector3(event.position.latitude, event.position.longitude, MARKER_RADIUS)
    _v.set(x, y, z)
    if (_v.clone().normalize().dot(camDir) <= FRONT_FACING_THRESHOLD) {
      // Behind the globe — still drawn (depth-occluded) but never clustered.
      backFacing.push(event)
      continue
    }
    _v.project(camera)
    screenPoints.push({
      id: event.id,
      x: (_v.x * 0.5 + 0.5) * width,
      y: (-_v.y * 0.5 + 0.5) * height,
      categoryId: event.categoryId
    })
  }

  const rawClusters = clusterScreenPoints(screenPoints, CLUSTER_THRESHOLD_PX)
  const singletons: NaturalEvent[] = [...backFacing]
  const clusters: GlobeCluster[] = []

  for (const cluster of rawClusters) {
    if (cluster.memberIds.length === 1) {
      const event = byId.get(cluster.memberIds[0])
      if (event) singletons.push(event)
      continue
    }
    const members = cluster.memberIds.map((id) => byId.get(id)).filter(Boolean) as NaturalEvent[]
    const centroid = members.reduce(
      (acc, e) => ({
        latitude: acc.latitude + e.position.latitude / members.length,
        longitude: acc.longitude + e.position.longitude / members.length
      }),
      { latitude: 0, longitude: 0 }
    )
    clusters.push({
      id: cluster.memberIds.join('-'),
      categoryId: cluster.categoryId,
      count: members.length,
      centroid
    })
  }

  return { singletons, clusters }
}
