import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group } from 'three'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { latLngToVector3 } from '@shared/utils/geo'
import { GLOBE_RADIUS } from './globeConstants'

const RING_RADIUS = GLOBE_RADIUS * 1.014

/**
 * A calm highlight ring around the currently selected event. Orients itself flat
 * against the sphere surface and breathes gently to draw the eye without
 * flashing.
 */
export function SelectionRing({ event }: { event: NaturalEvent }): JSX.Element {
  const groupRef = useRef<Group>(null)
  const color = resolveCategoryMeta(event.categoryId).color

  const [x, y, z] = latLngToVector3(
    event.position.latitude,
    event.position.longitude,
    RING_RADIUS
  )

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08
      groupRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef} position={[x, y, z]} onUpdate={(self) => self.lookAt(0, 0, 0)}>
      <mesh>
        <ringGeometry args={[0.028, 0.036, 48]} />
        <meshBasicMaterial color={new Color(color)} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}
