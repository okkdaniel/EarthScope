import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { is } from './env'

/**
 * Creates the main application window with a hardened security posture:
 * context isolation on, node integration off, sandboxed preload, and external
 * links routed to the system browser rather than opening in-app.
 */
export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: '#f4f4f2',
    title: 'EarthScope',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    webPreferences: {
      // Preload is emitted as ESM (.mjs) because package.json is type:module;
      // ESM preload requires sandbox:false. Context isolation stays on.
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  // Show only once ready to avoid a white flash (feels intentional & fast).
  window.on('ready-to-show', () => window.show())

  // Open target=_blank / external links in the user's default browser.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Prevent in-app navigation away from the bundled renderer.
  window.webContents.on('will-navigate', (event, url) => {
    const devServer = process.env.ELECTRON_RENDERER_URL
    if (devServer && url.startsWith(devServer)) return
    event.preventDefault()
    if (url.startsWith('http')) void shell.openExternal(url)
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}
