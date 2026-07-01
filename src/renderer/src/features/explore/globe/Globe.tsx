import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import type { NaturalEvent } from '@shared/models/event'
import { Earth } from './Earth'
import { Atmosphere } from './Atmosphere'
import { Starfield } from './Starfield'
import { EventMarkers } from './EventMarkers'
import { SelectionRing } from './SelectionRing'
import { CameraRig } from './CameraRig'
import { DEFAULT_CAMERA_DISTANCE } from './globeConstants'
import { useUiStore } from '../../../state/uiStore'
import { useSettingsStore } from '../../../state/settingsStore'

interface GlobeProps {
  events: NaturalEvent[]
}

/**
 * The interactive globe. A single Canvas hosts the Earth, atmosphere, stars and
 * the event point cloud. Selection and camera focus are driven by the UI store,
 * so the surrounding React UI and the 3D scene stay in sync through one source
 * of truth.
 */
export function Globe({ events }: GlobeProps): JSX.Element {
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const focusEventId = useUiStore((s) => s.focusEventId)
  const selectEvent = useUiStore((s) => s.selectEvent)
  const clearFocus = useUiStore((s) => s.clearFocus)
  const showAtmosphere = useSettingsStore((s) => s.settings.showAtmosphere)

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  )
  const focusEvent = useMemo(
    () => events.find((event) => event.id === focusEventId) ?? null,
    [events, focusEventId]
  )

  return (
    <Canvas
      camera={{ position: [0, 0.6, DEFAULT_CAMERA_DISTANCE], fov: 42, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => selectEvent(null)}
    >
      <color attach="background" args={['#070a0f']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#dfe8ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} color="#2a3550" />

      <Suspense fallback={null}>
        <Starfield />
        <Earth />
        <Atmosphere visible={showAtmosphere} />
        <EventMarkers events={events} onSelect={selectEvent} />
        {selectedEvent && <SelectionRing event={selectedEvent} />}
      </Suspense>

      <CameraRig focusPoint={focusEvent?.position ?? null} onArrived={clearFocus} />
    </Canvas>
  )
}
