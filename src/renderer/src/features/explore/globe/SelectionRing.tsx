import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group } from 'three'
import type { NaturalEvent } from '@shared/models/event'
import { latLngToVector3 } from '@shared/utils/geo'
import { GLOBE_RADIUS } from './globeConstants'

const RING_RADIUS = GLOBE_RADIUS * 1.014
const INK = new Color('#0a0a0a')

/**
 * A calm ink ring around the selected event — a drawn survey annotation, not a
 * glow. It lies flat against the sphere (so the far side is occluded like every
 * other mark) and breathes gently to draw the eye without flashing.
 */
export function SelectionRing({ event }: { event: NaturalEvent }): JSX.Element {
  const groupRef = useRef<Group>(null)

  const [x, y, z] = latLngToVector3(event.position.latitude, event.position.longitude, RING_RADIUS)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.06
      groupRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef} position={[x, y, z]} onUpdate={(self) => self.lookAt(0, 0, 0)}>
      <mesh>
        <ringGeometry args={[0.03, 0.034, 64]} />
        <meshBasicMaterial color={INK} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
