import type { EventCategoryId } from './category'

/**
 * User-configurable application settings.
 *
 * Persisted by the main process (see `src/main/store.ts`) and mirrored into the
 * renderer. Keep this serialisable (no functions, Sets or Maps) so it can cross
 * the IPC boundary and be written to disk as JSON.
 */

export type ThemeMode = 'dark' | 'light' | 'system'
export type DistanceUnit = 'metric' | 'imperial'

export interface AppSettings {
  /** Auto-refresh interval in minutes (0 disables auto-refresh). */
  readonly refreshIntervalMinutes: number
  readonly units: DistanceUnit
  readonly theme: ThemeMode
  /** Global multiplier for event/UI animations (0 = reduced motion). */
  readonly animationSpeed: number
  /** Idle auto-rotation speed of the globe (0 disables). */
  readonly globeAutoRotate: number
  /** Orbit-controls sensitivity multiplier. */
  readonly cameraSensitivity: number
  /** Show the atmospheric glow / clouds layers. */
  readonly showAtmosphere: boolean
  readonly showClouds: boolean
  /** Desktop notifications master switch. */
  readonly notificationsEnabled: boolean
  /** Per-category notification opt-in. */
  readonly notifyCategories: readonly EventCategoryId[]
  /** Maximum on-disk cache size in megabytes. */
  readonly cacheSizeMb: number
  /** Opt-in, disabled-by-default anonymous telemetry. */
  readonly telemetryEnabled: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  refreshIntervalMinutes: 15,
  units: 'metric',
  theme: 'dark',
  animationSpeed: 1,
  globeAutoRotate: 0.15,
  cameraSensitivity: 1,
  showAtmosphere: true,
  showClouds: true,
  notificationsEnabled: true,
  notifyCategories: ['wildfires', 'volcanoes', 'severeStorms', 'floods'],
  cacheSizeMb: 50,
  telemetryEnabled: false
}

/** Merge partial (possibly stale) persisted settings onto current defaults. */
export function normalizeSettings(partial: Partial<AppSettings> | null | undefined): AppSettings {
  return { ...DEFAULT_SETTINGS, ...(partial ?? {}) }
}
