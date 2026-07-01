import { memo, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  BufferGeometry,
  Float32BufferAttribute,
  NormalBlending,
  Points,
  ShaderMaterial
} from 'three'
import type { NaturalEvent } from '@shared/models/event'
import { latLngToVector3 } from '@shared/utils/geo'
import { markerVisualFor } from './markerVisuals'
import { markerFragmentShader, markerVertexShader } from './shaders/markerShader'
import { MARKER_RADIUS } from './globeConstants'
import { useSettingsStore } from '../../../state/settingsStore'

interface EventMarkersProps {
  events: NaturalEvent[]
  onSelect: (id: string) => void
  /** Reports the hovered event (or null) so a parent can show a tooltip. */
  onHover?: (event: NaturalEvent | null) => void
}

/**
 * Renders individual (non-clustered) events as a single GPU point cloud — one
 * draw call for hundreds of markers. Per-vertex attributes drive the
 * per-category animated shader; clicks and hovers resolve back to an event via
 * the hit index.
 */
export const EventMarkers = memo(function EventMarkers({
  events,
  onSelect,
  onHover
}: EventMarkersProps): JSX.Element | null {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const raycaster = useThree((s) => s.raycaster)
  const gl = useThree((s) => s.gl)
  const animationSpeed = useSettingsStore((s) => s.settings.animationSpeed)

  // Widen the pick threshold so the small sprites are comfortably clickable.
  useEffect(() => {
    if (raycaster.params.Points) raycaster.params.Points.threshold = 0.02
  }, [raycaster])

  const geometry = useMemo(() => {
    const count = events.length
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const types = new Float32Array(count)
    const phases = new Float32Array(count)
    const sizes = new Float32Array(count)
    const active = new Float32Array(count)

    events.forEach((event, i) => {
      const [x, y, z] = latLngToVector3(
        event.position.latitude,
        event.position.longitude,
        MARKER_RADIUS
      )
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const visual = markerVisualFor(event.categoryId)
      colors[i * 3] = visual.color.r
      colors[i * 3 + 1] = visual.color.g
      colors[i * 3 + 2] = visual.color.b
      types[i] = visual.visualId
      phases[i] = (i * 12.9898) % (Math.PI * 2)
      sizes[i] = visual.size
      active[i] = event.isActive ? 1 : 0
    })

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3))
    geo.setAttribute('aType', new Float32BufferAttribute(types, 1))
    geo.setAttribute('aPhase', new Float32BufferAttribute(phases, 1))
    geo.setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
    geo.setAttribute('aActive', new Float32BufferAttribute(active, 1))
    return geo
  }, [events])

  // Dispose replaced geometries to avoid GPU memory leaks on refetch/filtering.
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: markerVertexShader,
        fragmentShader: markerFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uSizeScale: { value: 1 }
        }
      }),
    [gl]
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * Math.max(0.001, animationSpeed)
    }
  })

  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    if (event.index == null) return
    event.stopPropagation()
    const hit = events[event.index]
    if (hit) onSelect(hit.id)
  }

  const handleMove = (event: ThreeEvent<PointerEvent>): void => {
    if (event.index == null) return
    event.stopPropagation()
    const hit = events[event.index]
    if (hit) {
      document.body.style.cursor = 'pointer'
      onHover?.(hit)
    }
  }

  const handleOut = (): void => {
    document.body.style.cursor = ''
    onHover?.(null)
  }

  // Reset the cursor if this layer unmounts while hovered.
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  if (events.length === 0) return null

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerOut={handleOut}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  )
})
