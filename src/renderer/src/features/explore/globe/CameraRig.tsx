import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { latLngToVector3 } from '@shared/utils/geo'
import type { GeoPoint } from '@shared/models/geo'
import {
  CAMERA_MAX_DISTANCE,
  CAMERA_MIN_DISTANCE
} from './globeConstants'
import { useSettingsStore } from '../../../state/settingsStore'

interface CameraRigProps {
  /** When set, the camera smoothly flies to bring this point to the front. */
  focusPoint: GeoPoint | null
  onArrived: () => void
}

const FLY_EPSILON = 0.002

/**
 * Orbit controls with inertial damping plus a smooth "fly-to" that eases the
 * camera so a chosen event rotates to face the viewer. Movement is damped and
 * eased — never abrupt (CLAUDE.md: Motion).
 */
export function CameraRig({ focusPoint, onArrived }: CameraRigProps): JSX.Element {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const targetPos = useRef<Vector3 | null>(null)

  const sensitivity = useSettingsStore((s) => s.settings.cameraSensitivity)
  const autoRotate = useSettingsStore((s) => s.settings.globeAutoRotate)

  useEffect(() => {
    if (!focusPoint) return
    const distance = camera.position.length()
    const [x, y, z] = latLngToVector3(focusPoint.latitude, focusPoint.longitude, distance)
    targetPos.current = new Vector3(x, y, z)
  }, [focusPoint, camera])

  useFrame(() => {
    const controls = controlsRef.current
    if (targetPos.current && controls) {
      camera.position.lerp(targetPos.current, 0.08)
      controls.update()
      if (camera.position.distanceTo(targetPos.current) < FLY_EPSILON) {
        targetPos.current = null
        onArrived()
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.42 * sensitivity}
      zoomSpeed={0.7 * sensitivity}
      minDistance={CAMERA_MIN_DISTANCE}
      maxDistance={CAMERA_MAX_DISTANCE}
      autoRotate={autoRotate > 0 && !targetPos.current}
      autoRotateSpeed={autoRotate}
    />
  )
}
