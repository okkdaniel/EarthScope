import { useMemo } from 'react'
import { BackSide, Color } from 'three'
import { getWorldLineGeometry } from './geo/worldGeometry'
import { GLOBE_RADIUS } from './globeConstants'

const OCEAN_COLOR = new Color('#0e1a2b')
const COASTLINE_COLOR = new Color('#5b7089')
const BORDER_COLOR = new Color('#33465c')

/**
 * The vector-style Earth: a deep navy ocean sphere overlaid with thin coastline
 * and country-border lines. No textures, no photorealism — a calm scientific
 * visualisation that stays readable at every zoom level (CLAUDE.md: Globe Design).
 */
export function Earth(): JSX.Element {
  const { coastlines, borders } = useMemo(() => getWorldLineGeometry(GLOBE_RADIUS * 1.001), [])

  return (
    <group>
      {/* Ocean body */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
        <meshStandardMaterial
          color={OCEAN_COLOR}
          roughness={0.85}
          metalness={0.05}
          emissive={new Color('#060c15')}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* A faint inner shell adds depth to the limb without extra geometry. */}
      <mesh scale={0.999}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial color={new Color('#0a1420')} side={BackSide} />
      </mesh>

      {/* Country borders (dimmer, drawn first) */}
      <lineSegments geometry={borders}>
        <lineBasicMaterial color={BORDER_COLOR} transparent opacity={0.55} />
      </lineSegments>

      {/* Coastlines (brighter, on top) */}
      <lineSegments geometry={coastlines}>
        <lineBasicMaterial color={COASTLINE_COLOR} transparent opacity={0.9} />
      </lineSegments>
    </group>
  )
}
