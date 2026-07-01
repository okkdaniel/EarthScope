import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC,
  type AppInfo,
  type EarthScopeBridge,
  type EventQueryDto,
  type EventsFetchResult,
  type NotificationPayload
} from '@shared/ipc'
import type { AppSettings } from '@shared/models/settings'

/**
 * The context-isolation bridge.
 *
 * Only this narrow, typed surface is exposed to the renderer as
 * `window.earthscope`. No raw ipcRenderer, no Node primitives — the renderer
 * cannot reach anything not listed here, which is the core of the security
 * model.
 */
const bridge: EarthScopeBridge = {
  fetchEvents: (query: EventQueryDto): Promise<EventsFetchResult> =>
    ipcRenderer.invoke(IPC.events.fetch, query),

  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.settings.get),

  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.settings.update, patch),

  onSettingsChanged: (listener: (settings: AppSettings) => void): (() => void) => {
    const handler = (_event: unknown, settings: AppSettings): void => listener(settings)
    ipcRenderer.on(IPC.settings.changed, handler)
    return () => ipcRenderer.removeListener(IPC.settings.changed, handler)
  },

  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IPC.app.getInfo),

  showNotification: (payload: NotificationPayload): Promise<void> =>
    ipcRenderer.invoke(IPC.notifications.show, payload),

  onNetworkStatusChanged: (listener: (online: boolean) => void): (() => void) => {
    const handler = (_event: unknown, online: boolean): void => listener(online)
    ipcRenderer.on(IPC.network.statusChanged, handler)
    return () => ipcRenderer.removeListener(IPC.network.statusChanged, handler)
  }
}

contextBridge.exposeInMainWorld('earthscope', bridge)
