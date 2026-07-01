import { app, ipcMain, Notification } from 'electron'
import {
  IPC,
  type AppInfo,
  type EventQueryDto,
  type EventsFetchResult,
  type NotificationPayload
} from '@shared/ipc'
import type { AppSettings } from '@shared/models/settings'
import { createDefaultRegistry } from '@shared/providers/registry'
import { createLogger } from './logger'
import { EventCacheStore, SettingsStore } from './store'

const log = createLogger('ipc')

/**
 * Registers every IPC handler. The main process owns all network and disk
 * access; the renderer only ever asks via these typed channels. This keeps the
 * renderer sandboxed and the data/caching policy in one place.
 */
export function registerIpcHandlers(settingsStore: SettingsStore): void {
  const cacheStore = new EventCacheStore()

  // The registry consults live settings so a disabled provider is skipped.
  let providerEnabled = true
  settingsStore.get().then(() => undefined)
  const registry = createDefaultRegistry({ eonetEnabled: () => providerEnabled })

  ipcMain.handle(
    IPC.events.fetch,
    async (_event, query: EventQueryDto): Promise<EventsFetchResult> => {
      const result = await registry.fetchAll(query)

      if (result.ok) {
        await cacheStore.write(result.value).catch((e) => log.warn('cache write failed', e))
        return { events: result.value, fromCache: false, fetchedAt: new Date().toISOString() }
      }

      // Live fetch failed — fall back to the offline cache if we have one.
      log.warn(`live fetch failed (${result.error.kind}): ${result.error.message}`)
      const cache = await cacheStore.read()
      if (cache) {
        return {
          events: cache.events,
          fromCache: true,
          fetchedAt: cache.fetchedAt,
          error: result.error
        }
      }
      return { events: [], fromCache: false, fetchedAt: new Date().toISOString(), error: result.error }
    }
  )

  ipcMain.handle(IPC.settings.get, (): Promise<AppSettings> => settingsStore.get())

  ipcMain.handle(
    IPC.settings.update,
    async (_event, patch: Partial<AppSettings>): Promise<AppSettings> => {
      const next = await settingsStore.update(patch)
      providerEnabled = true // EONET is always available; reserved for future toggles.
      return next
    }
  )

  ipcMain.handle(IPC.app.getInfo, (): AppInfo => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform
    }
  })

  ipcMain.handle(IPC.app.getVersion, () => app.getVersion())

  ipcMain.handle(IPC.notifications.show, (_event, payload: NotificationPayload): void => {
    if (!Notification.isSupported()) return
    new Notification({ title: payload.title, body: payload.body }).show()
  })
}
