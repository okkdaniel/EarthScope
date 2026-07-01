import { memo, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, Vector3 } from 'three'
import type { GeoPoint } from '@shared/models/geo'
import { resolveCategoryMeta } from '@shared/models/category'
import { latLngToVector3 } from '@shared/utils/geo'
import { MARKER_RADIUS } from './globeConstants'

export interface GlobeCluster {
  readonly id: string
  readonly categoryId: string
  readonly count: number
  readonly centroid: GeoPoint
}

interface ClusterMarkersProps {
  clusters: GlobeCluster[]
  onClusterClick: (cluster: GlobeCluster) => void
}

/** Renders cluster badges (a count over a category-coloured disc) on the globe. */
export const ClusterMarkers = memo(function ClusterMarkers({
  clusters,
  onClusterClick
}: ClusterMarkersProps): JSX.Element {
  return (
    <>
      {clusters.map((cluster) => (
        <ClusterBadge key={cluster.id} cluster={cluster} onClick={onClusterClick} />
      ))}
    </>
  )
})

const FRONT_FACING_THRESHOLD = 0.12

function ClusterBadge({
  cluster,
  onClick
}: {
  cluster: GlobeCluster
  onClick: (cluster: GlobeCluster) => void
}): JSX.Element {
  const groupRef = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const meta = resolveCategoryMeta(cluster.categoryId)

  const position = useMemo(
    () =>
      new Vector3(
        ...latLngToVector3(cluster.centroid.latitude, cluster.centroid.longitude, MARKER_RADIUS)
      ),
    [cluster.centroid.latitude, cluster.centroid.longitude]
  )
  const normal = useMemo(() => position.clone().normalize(), [position])

  // Hide badges on the far side of the globe so they don't show through it.
  useFrame(() => {
    if (groupRef.current) {
      const facing = normal.dot(camera.position.clone().normalize()) > FRONT_FACING_THRESHOLD
      groupRef.current.visible = facing
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick(cluster)
          }}
          aria-label={`${cluster.count} ${meta.label} events — zoom in`}
          className="tabular hover-fade flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-2xs text-content-primary"
          style={{
            pointerEvents: 'auto',
            background: '#ffffff',
            border: `1.5px solid ${meta.color}`
          }}
        >
          {cluster.count}
        </button>
      </Html>
    </group>
  )
}
