import { create } from 'zustand'

/** Top-level navigable sections (CLAUDE.md: never exceed two nav levels). */
export type ViewId = 'dashboard' | 'explore' | 'timeline' | 'analytics' | 'settings' | 'about'

interface UiState {
  view: ViewId
  /** Currently selected event id (drives the detail panel and globe focus). */
  selectedEventId: string | null
  /** Event id the globe should fly to; cleared once the camera arrives. */
  focusEventId: string | null
  commandPaletteOpen: boolean
  setView: (view: ViewId) => void
  selectEvent: (id: string | null) => void
  focusEvent: (id: string) => void
  clearFocus: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
}

export const useUiStore = create<UiState>((set) => ({
  view: 'dashboard',
  selectedEventId: null,
  focusEventId: null,
  commandPaletteOpen: false,
  setView: (view) => set({ view }),
  selectEvent: (id) => set({ selectedEventId: id }),
  focusEvent: (id) => set({ focusEventId: id, selectedEventId: id, view: 'explore' }),
  clearFocus: () => set({ focusEventId: null }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen }))
}))
