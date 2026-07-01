import { useMemo } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute } from 'three'
import { latLngToVector3 } from '@shared/utils/geo'
import { getWorldLineGeometry } from './geo/worldGeometry'
import { GLOBE_RADIUS } from './globeConstants'

const SPHERE_COLOR = new Color('#edede9') // warm paper, a touch deeper than the canvas
const COASTLINE_COLOR = new Color('#0a0a0a') // ink
const BORDER_COLOR = new Color('#6b6b68') // secondary ink
const GRATICULE_COLOR = new Color('#c9c9c4') // quiet hairline

/**
 * The Earth as an engineering survey: a warm paper sphere carrying thin ink
 * coastlines, quieter country borders and a faint graticule — the same
 * ink-on-warm-gray, iso-line language as the brand contour mark. No textures,
 * no photorealism, no atmosphere glow. Colour is reserved entirely for events.
 */
export function Earth(): JSX.Element {
  const { coastlines, borders } = useMemo(
    () => getWorldLineGeometry(GLOBE_RADIUS * 1.001),
    []
  )
  const graticule = useMemo(() => buildGraticule(GLOBE_RADIUS * 1.0015), [])

  return (
    <group>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
        <meshStandardMaterial color={SPHERE_COLOR} roughness={0.95} metalness={0} />
      </mesh>

      <lineSegments geometry={graticule}>
        <lineBasicMaterial color={GRATICULE_COLOR} transparent opacity={0.5} />
      </lineSegments>

      <lineSegments geometry={borders}>
        <lineBasicMaterial color={BORDER_COLOR} transparent opacity={0.45} />
      </lineSegments>

      <lineSegments geometry={coastlines}>
        <lineBasicMaterial color={COASTLINE_COLOR} transparent opacity={0.85} />
      </lineSegments>
    </group>
  )
}

/** Build a sparse lat/long graticule (every 30°) as sphere line segments. */
function buildGraticule(radius: number): BufferGeometry {
  const positions: number[] = []
  const STEP = 30
  const SEG = 4

  // Parallels (constant latitude).
  for (let lat = -60; lat <= 60; lat += STEP) {
    for (let lng = -180; lng < 180; lng += SEG) {
      pushSegment(positions, lat, lng, lat, lng + SEG, radius)
    }
  }
  // Meridians (constant longitude).
  for (let lng = -180; lng < 180; lng += STEP) {
    for (let lat = -90; lat < 90; lat += SEG) {
      pushSegment(positions, lat, lng, lat + SEG, lng, radius)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function pushSegment(
  out: number[],
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
  radius: number
): void {
  const a = latLngToVector3(latA, lngA, radius)
  const b = latLngToVector3(latB, lngB, radius)
  out.push(a[0], a[1], a[2], b[0], b[1], b[2])
}
