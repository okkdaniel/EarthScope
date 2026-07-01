import { app, BrowserWindow } from 'electron'
import { APP_NAME } from '@shared/constants'
import { is } from './env'
import { registerIpcHandlers } from './ipc'
import { createLogger } from './logger'
import { buildAppMenu } from './menu'
import { SettingsStore } from './store'
import { createMainWindow } from './window'

const log = createLogger('main')

// Enforce a single running instance — focus the existing window instead.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  bootstrap()
}

function bootstrap(): void {
  app.setName(APP_NAME)
  const settingsStore = new SettingsStore()
  let mainWindow: BrowserWindow | null = null

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    registerIpcHandlers(settingsStore)
    buildAppMenu()
    mainWindow = createMainWindow()

    app.on('activate', () => {
      // macOS: re-create a window when the dock icon is clicked and none exist.
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow()
      }
    })

    log.info(`${APP_NAME} ready (electron ${process.versions.electron})`)
  })

  app.on('window-all-closed', () => {
    // Standard macOS behaviour is to stay open until Cmd+Q.
    if (!is.macOS) app.quit()
  })

  // Harden against unexpected new-window / webview creation.
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
  })

  process.on('uncaughtException', (error) => log.error('uncaught exception', error))
  process.on('unhandledRejection', (reason) => log.error('unhandled rejection', reason))
}
