import { create } from 'zustand'
import type { GeoPoint } from '@shared/models/geo'

/** Top-level navigable sections (CLAUDE.md: never exceed two nav levels). */
export type ViewId = 'dashboard' | 'explore' | 'timeline' | 'analytics' | 'settings' | 'about'

/** An imperative camera destination for a location that isn't an event (e.g. a cluster). */
export interface FocusLocation extends GeoPoint {
  /** Desired camera distance on arrival. */
  readonly distance: number
}

interface UiState {
  view: ViewId
  /** The active event — highlighted in the list and, once the camera arrives, shown in the panel. */
  selectedEventId: string | null
  /** Event the camera is flying to; cleared on arrival. While set, the panel stays closed. */
  focusEventId: string | null
  /** A non-event camera destination (cluster zoom); cleared on arrival. */
  focusLocation: FocusLocation | null
  commandPaletteOpen: boolean
  setView: (view: ViewId) => void
  /** Select an event: highlight it immediately and fly the camera to it. `null` clears. */
  selectEvent: (id: string | null) => void
  /** Like {@link selectEvent} but also switches to the Explore view (used from other views). */
  focusEvent: (id: string) => void
  /** Fly to an arbitrary location without changing the selection. */
  flyToLocation: (location: FocusLocation) => void
  /** Signal that the camera has reached its destination. */
  clearFocus: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
}

export const useUiStore = create<UiState>((set) => ({
  view: 'dashboard',
  selectedEventId: null,
  focusEventId: null,
  focusLocation: null,
  commandPaletteOpen: false,
  setView: (view) => set({ view }),
  selectEvent: (id) =>
    set(
      id
        ? { selectedEventId: id, focusEventId: id, focusLocation: null }
        : { selectedEventId: null, focusEventId: null, focusLocation: null }
    ),
  focusEvent: (id) =>
    set({ view: 'explore', selectedEventId: id, focusEventId: id, focusLocation: null }),
  flyToLocation: (location) => set({ focusLocation: location, focusEventId: null }),
  clearFocus: () => set({ focusEventId: null, focusLocation: null }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen }))
}))

/** The event detail panel is visible only once the camera has settled on the selection. */
export function selectDetailVisible(s: UiState): boolean {
  return s.selectedEventId !== null && s.focusEventId === null && s.focusLocation === null
}
