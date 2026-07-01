import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import type { NaturalEvent } from '@shared/models/event'
import { Earth } from './Earth'
import { MarkerLayer } from './MarkerLayer'
import { SelectionRing } from './SelectionRing'
import { CameraRig, type CameraTarget } from './CameraRig'
import { DEFAULT_CAMERA_DISTANCE } from './globeConstants'
import { useUiStore } from '../../../state/uiStore'
import { useSettingsStore } from '../../../state/settingsStore'

interface GlobeProps {
  events: NaturalEvent[]
}

/**
 * The interactive globe. A single Canvas hosts the Earth, atmosphere, stars and
 * the marker/cluster layer. Selection and camera focus are driven by the UI
 * store, so the surrounding React UI and the 3D scene share one source of truth.
 */
export function Globe({ events }: GlobeProps): JSX.Element {
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const focusEventId = useUiStore((s) => s.focusEventId)
  const focusLocation = useUiStore((s) => s.focusLocation)
  const selectEvent = useUiStore((s) => s.selectEvent)
  const clearFocus = useUiStore((s) => s.clearFocus)
  const showGraticule = useSettingsStore((s) => s.settings.showAtmosphere)

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  )

  // Resolve the current camera destination (an event, a cluster, or none).
  const cameraTarget = useMemo<CameraTarget | null>(() => {
    if (focusEventId) {
      const event = events.find((e) => e.id === focusEventId)
      return event ? { point: event.position } : null
    }
    if (focusLocation) {
      return {
        point: { latitude: focusLocation.latitude, longitude: focusLocation.longitude },
        distance: focusLocation.distance
      }
    }
    return null
  }, [focusEventId, focusLocation, events])

  return (
    <Canvas
      camera={{ position: [0, 0.6, DEFAULT_CAMERA_DISTANCE], fov: 42, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => selectEvent(null)}
    >
      {/* Warm canvas — the globe sits on the page like a plate, no dark void.
          The sphere and lines are unlit, so the scene needs no lights. */}
      <color attach="background" args={['#f4f4f2']} />

      <Suspense fallback={null}>
        <Earth showGraticule={showGraticule} />
        <MarkerLayer events={events} onSelect={selectEvent} />
        {selectedEvent && <SelectionRing event={selectedEvent} />}
      </Suspense>

      <CameraRig target={cameraTarget} onArrived={clearFocus} />
    </Canvas>
  )
}
