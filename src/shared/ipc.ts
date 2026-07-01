import type { NaturalEvent } from './models/event'
import type { AppSettings } from './models/settings'
import type { EventQuery } from './providers/types'
import type { AppError } from './utils/result'

/**
 * The typed contract between the Electron main process and the renderer.
 *
 * Channel names live here as constants (never magic strings) and the payload
 * shapes are shared so the preload bridge, main handlers and renderer client
 * all stay in lock-step. This is the only place IPC strings are declared.
 */

export const IPC = {
  events: {
    fetch: 'events:fetch'
  },
  settings: {
    get: 'settings:get',
    update: 'settings:update',
    changed: 'settings:changed'
  },
  app: {
    getVersion: 'app:get-version',
    getInfo: 'app:get-info'
  },
  notifications: {
    show: 'notifications:show'
  },
  network: {
    statusChanged: 'network:status-changed'
  }
} as const

/** Serialisable form of an events query (AbortSignal cannot cross IPC). */
export type EventQueryDto = Omit<EventQuery, 'signal'>

export interface EventsFetchResult {
  readonly events: NaturalEvent[]
  /** True when results were served from the offline cache. */
  readonly fromCache: boolean
  /** ISO timestamp of when the returned data was fetched. */
  readonly fetchedAt: string
  /** Present when the live fetch failed (cache may still be returned). */
  readonly error?: AppError
}

export interface AppInfo {
  readonly name: string
  readonly version: string
  readonly electron: string
  readonly chrome: string
  readonly node: string
  readonly platform: NodeJS.Platform
}

export interface NotificationPayload {
  readonly title: string
  readonly body: string
  readonly eventId?: string
}

/**
 * The surface exposed to the renderer on `window.earthscope`. Mirrored by the
 * preload bridge and by the renderer-side `.d.ts` global declaration.
 */
export interface EarthScopeBridge {
  fetchEvents(query: EventQueryDto): Promise<EventsFetchResult>
  getSettings(): Promise<AppSettings>
  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings>
  onSettingsChanged(listener: (settings: AppSettings) => void): () => void
  getAppInfo(): Promise<AppInfo>
  showNotification(payload: NotificationPayload): Promise<void>
  onNetworkStatusChanged(listener: (online: boolean) => void): () => void
}
