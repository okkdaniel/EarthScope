import type { EventsFetchResult, EventQueryDto, AppInfo, NotificationPayload } from '@shared/ipc'
import type { AppSettings } from '@shared/models/settings'

/**
 * Thin renderer-side wrapper over the preload bridge.
 *
 * Centralising access to `window.earthscope` means components never touch the
 * global directly, the bridge can be mocked in tests, and a missing bridge
 * (e.g. running the renderer in a plain browser during Storybook/dev) fails
 * with a clear message instead of a cryptic `undefined`.
 */
function bridge() {
  if (typeof window === 'undefined' || !window.earthscope) {
    throw new Error('EarthScope bridge unavailable — renderer must run inside Electron.')
  }
  return window.earthscope
}

export const client = {
  fetchEvents: (query: EventQueryDto): Promise<EventsFetchResult> => bridge().fetchEvents(query),
  getSettings: (): Promise<AppSettings> => bridge().getSettings(),
  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    bridge().updateSettings(patch),
  getAppInfo: (): Promise<AppInfo> => bridge().getAppInfo(),
  showNotification: (payload: NotificationPayload): Promise<void> =>
    bridge().showNotification(payload),
  onSettingsChanged: (listener: (settings: AppSettings) => void): (() => void) =>
    bridge().onSettingsChanged(listener),
  onNetworkStatusChanged: (listener: (online: boolean) => void): (() => void) =>
    bridge().onNetworkStatusChanged(listener)
}

/** True when the Electron bridge is present (false in a bare browser). */
export function hasBridge(): boolean {
  return typeof window !== 'undefined' && Boolean(window.earthscope)
}
