import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { CommandPalette } from './features/search/CommandPalette'
import { ViewLoader } from './components/common/ViewLoader'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useEventNotifications } from './hooks/useEventNotifications'
import { useTheme } from './hooks/useTheme'
import { useSettingsStore } from './state/settingsStore'
import { useUiStore, type ViewId } from './state/uiStore'

/**
 * Views are code-split with React.lazy so the heavy dependencies they pull in —
 * Three.js for the globe (Explore, Timeline) and Recharts for Analytics — are
 * only downloaded when first visited. The Dashboard stays lightweight for a fast
 * cold start (CLAUDE.md: Fast startup · code splitting · lazy loading).
 */
const named = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })))

const VIEWS: Record<ViewId, ComponentType> = {
  dashboard: named(() => import('./features/dashboard/DashboardView'), 'DashboardView'),
  explore: named(() => import('./features/explore/ExploreView'), 'ExploreView'),
  timeline: named(() => import('./features/timeline/TimelineView'), 'TimelineView'),
  analytics: named(() => import('./features/analytics/AnalyticsView'), 'AnalyticsView'),
  settings: named(() => import('./features/settings/SettingsView'), 'SettingsView'),
  about: named(() => import('./features/about/AboutView'), 'AboutView')
}

export function App(): JSX.Element {
  const view = useUiStore((s) => s.view)
  const hydrate = useSettingsStore((s) => s.hydrate)
  const commandPaletteOpen = useUiStore((s) => s.commandPaletteOpen)

  useTheme()
  useKeyboardShortcuts()
  useEventNotifications()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const ActiveView = VIEWS[view]

  return (
    <div className="flex h-full w-full bg-surface-base text-content-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <Suspense fallback={<ViewLoader />}>
            <ActiveView />
          </Suspense>
        </main>
        <StatusBar />
      </div>
      <AnimatePresence>{commandPaletteOpen && <CommandPalette />}</AnimatePresence>
    </div>
  )
}
