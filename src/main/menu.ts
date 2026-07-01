import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import { is } from './env'

/**
 * Builds a minimal, platform-appropriate application menu. Kept intentionally
 * sparse — EarthScope's navigation lives in-app, not in menu bars.
 */
export function buildAppMenu(): void {
  const template: MenuItemConstructorOptions[] = []

  if (is.macOS) {
    template.push({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  template.push({
    label: 'File',
    submenu: [is.macOS ? { role: 'close' } : { role: 'quit' }]
  })

  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  })

  template.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  })

  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'NASA EONET',
        click: () => void shell.openExternal('https://eonet.gsfc.nasa.gov')
      },
      {
        label: 'Report an Issue',
        click: () =>
          void shell.openExternal('https://github.com/earthscope-app/earthscope/issues')
      }
    ]
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
