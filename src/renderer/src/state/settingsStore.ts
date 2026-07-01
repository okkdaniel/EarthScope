import { create } from 'zustand'
import { DEFAULT_SETTINGS, type AppSettings } from '@shared/models/settings'
import { client, hasBridge } from '../api/client'

interface SettingsState {
  settings: AppSettings
  hydrated: boolean
  /** Load persisted settings from the main process (called once at startup). */
  hydrate: () => Promise<void>
  /** Persist a partial update and reflect it locally. */
  update: (patch: Partial<AppSettings>) => Promise<void>
}

/**
 * Settings are the source of truth in the main process; this store mirrors them
 * for synchronous reads in the UI. Writes optimistically update the mirror then
 * persist, so toggles feel instant.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    if (!hasBridge()) {
      set({ hydrated: true })
      return
    }
    const settings = await client.getSettings()
    set({ settings, hydrated: true })
  },
  update: async (patch) => {
    const optimistic = { ...get().settings, ...patch }
    set({ settings: optimistic })
    if (!hasBridge()) return
    const persisted = await client.updateSettings(patch)
    set({ settings: persisted })
  }
}))
