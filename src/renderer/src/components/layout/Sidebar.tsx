import {
  Globe2,
  LayoutDashboard,
  Clock,
  BarChart3,
  Settings,
  Info,
  Search,
  type LucideIcon
} from 'lucide-react'
import { useUiStore, type ViewId } from '../../state/uiStore'
import { cn } from '../../utils/cn'

interface NavEntry {
  id: ViewId
  label: string
  icon: LucideIcon
}

const PRIMARY_NAV: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explore', label: 'Explore', icon: Globe2 },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
]

const SECONDARY_NAV: NavEntry[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info }
]

/**
 * The primary navigation rail. Two flat levels only (CLAUDE.md: never exceed
 * two nav levels). The globe/Explore is the visual centre of the product, so
 * navigation stays deliberately quiet beside it.
 */
export function Sidebar(): JSX.Element {
  const view = useUiStore((s) => s.view)
  const setView = useUiStore((s) => s.setView)
  const openCommandPalette = useUiStore((s) => s.openCommandPalette)

  return (
    <nav
      aria-label="Primary"
      className="flex w-56 shrink-0 flex-col gap-1 border-r border-surface-border bg-surface-raised px-3 py-4"
    >
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
          <Globe2 className="h-4.5 w-4.5 text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-semibold tracking-tight">EarthScope</span>
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        className="mb-3 flex items-center gap-2 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-content-tertiary transition-colors hover:border-surface-hover hover:text-content-secondary"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>Search events</span>
        <kbd className="ml-auto rounded border border-surface-border bg-surface-raised px-1.5 py-0.5 text-2xs font-medium text-content-tertiary">
          ⌘K
        </kbd>
      </button>

      <div className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((entry) => (
          <NavButton key={entry.id} entry={entry} active={view === entry.id} onSelect={setView} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-surface-border pt-3">
        {SECONDARY_NAV.map((entry) => (
          <NavButton key={entry.id} entry={entry} active={view === entry.id} onSelect={setView} />
        ))}
      </div>
    </nav>
  )
}

function NavButton({
  entry,
  active,
  onSelect
}: {
  entry: NavEntry
  active: boolean
  onSelect: (id: ViewId) => void
}): JSX.Element {
  const Icon = entry.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.id)}
      data-active={active}
      aria-current={active ? 'page' : undefined}
      className={cn('nav-item', 'w-full text-left')}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span>{entry.label}</span>
    </button>
  )
}
