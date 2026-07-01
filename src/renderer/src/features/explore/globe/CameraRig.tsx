import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { latLngToVector3 } from '@shared/utils/geo'
import type { GeoPoint } from '@shared/models/geo'
import {
  CAMERA_MAX_DISTANCE,
  CAMERA_MIN_DISTANCE,
  DEFAULT_CAMERA_DISTANCE,
  FLY_DURATION_S,
  FOCUS_CAMERA_DISTANCE,
  IDLE_RESUME_MS,
  IDLE_ZOOM_GATE
} from './globeConstants'
import { useSettingsStore } from '../../../state/settingsStore'

/** A resolved camera destination. `distance` omitted ⇒ ease to the focus distance. */
export interface CameraTarget {
  readonly point: GeoPoint
  readonly distance?: number
}

interface CameraRigProps {
  target: CameraTarget | null
  /** Fired when the camera reaches the target, or when the user takes over. */
  onArrived: () => void
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

interface FlightState {
  fromDir: Vector3
  fromRadius: number
  toDir: Vector3
  toRadius: number
  elapsed: number
}

/**
 * Orbit controls plus a smooth, interruptible "fly-to".
 *
 * The globe is never locked: rotate and zoom stay live at all times, and the
 * moment the user drags or scrolls, any in-progress flight yields to them. The
 * flight itself eases along an arc (direction slerp-approximation + radius
 * interpolation) with cubic in-out timing for an Apple-Maps-like glide.
 *
 * Idle auto-rotation is deliberately quiet: it stops on any interaction and only
 * resumes after a period of stillness *and* only when the user is back near the
 * default zoom — so it never nudges the globe while an event is being inspected.
 */
export function CameraRig({ target, onArrived }: CameraRigProps): JSX.Element {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const domElement = useThree((s) => s.gl.domElement)

  const sensitivity = useSettingsStore((s) => s.settings.cameraSensitivity)
  const autoRotateSetting = useSettingsStore((s) => s.settings.globeAutoRotate)

  const flight = useRef<FlightState | null>(null)
  const lastInteraction = useRef(0)
  const pointer = useRef({ down: false, x: 0, y: 0, dragging: false })

  const targetVector = useMemo(() => {
    if (!target) return null
    const dir = new Vector3(
      ...latLngToVector3(target.point.latitude, target.point.longitude, 1)
    ).normalize()
    return { dir, distance: target.distance }
  }, [target])

  // Begin (or redirect) a flight whenever the destination changes. Redirecting
  // mid-flight simply re-captures the current position as the new start, so
  // switching events never snaps or glitches.
  useEffect(() => {
    if (!targetVector) {
      flight.current = null
      return
    }
    const fromRadius = camera.position.length()
    const toRadius = clamp(
      targetVector.distance ?? Math.min(fromRadius, FOCUS_CAMERA_DISTANCE),
      CAMERA_MIN_DISTANCE,
      CAMERA_MAX_DISTANCE
    )
    flight.current = {
      fromDir: camera.position.clone().normalize(),
      fromRadius,
      toDir: targetVector.dir.clone(),
      toRadius,
      elapsed: 0
    }
  }, [targetVector, camera])

  // Track user input directly on the canvas so we can (a) suppress idle rotation
  // and (b) hand control back instantly when the user starts dragging/zooming.
  useEffect(() => {
    const cancelFlight = (): void => {
      if (flight.current) {
        flight.current = null
        onArrived()
      }
    }
    const onPointerDown = (e: PointerEvent): void => {
      pointer.current = { down: true, x: e.clientX, y: e.clientY, dragging: false }
      lastInteraction.current = performance.now()
    }
    const onPointerMove = (e: PointerEvent): void => {
      if (!pointer.current.down) return
      const moved = Math.hypot(e.clientX - pointer.current.x, e.clientY - pointer.current.y)
      if (moved > 4) {
        pointer.current.dragging = true
        lastInteraction.current = performance.now()
        cancelFlight()
      }
    }
    const onPointerUp = (): void => {
      pointer.current.down = false
    }
    const onWheel = (): void => {
      lastInteraction.current = performance.now()
      cancelFlight()
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointermove', onPointerMove)
    domElement.addEventListener('pointerup', onPointerUp)
    domElement.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('wheel', onWheel)
    }
  }, [domElement, onArrived])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const active = flight.current
    if (active) {
      active.elapsed += delta
      const t = easeInOutCubic(clamp(active.elapsed / FLY_DURATION_S, 0, 1))
      // Interpolate direction then re-normalise → a smooth arc across the sphere.
      const dir = active.fromDir.clone().lerp(active.toDir, t).normalize()
      const radius = active.fromRadius + (active.toRadius - active.fromRadius) * t
      camera.position.copy(dir.multiplyScalar(radius))
      camera.lookAt(0, 0, 0)
      if (active.elapsed >= FLY_DURATION_S) {
        flight.current = null
        onArrived()
      }
    }

    // Idle auto-rotation: only when enabled, not flying, after a still period,
    // and only near the default zoom (never while inspecting up close).
    const distance = camera.position.length()
    const idleElapsed = performance.now() - lastInteraction.current
    const nearDefaultZoom = distance >= DEFAULT_CAMERA_DISTANCE * IDLE_ZOOM_GATE
    controls.autoRotate =
      autoRotateSetting > 0 && !flight.current && idleElapsed > IDLE_RESUME_MS && nearDefaultZoom
    controls.autoRotateSpeed = autoRotateSetting * 2
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.42 * sensitivity}
      zoomSpeed={0.75 * sensitivity}
      minDistance={CAMERA_MIN_DISTANCE}
      maxDistance={CAMERA_MAX_DISTANCE}
    />
  )
}
