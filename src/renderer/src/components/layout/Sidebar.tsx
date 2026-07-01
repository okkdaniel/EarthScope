import { useUiStore, type ViewId } from '../../state/uiStore'
import { Eyebrow } from '../editorial/Eyebrow'
import { AnuraLogo } from '../editorial/AnuraLogo'
import { cn } from '../../utils/cn'

interface NavEntry {
  id: ViewId
  label: string
}

const PRIMARY_NAV: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'explore', label: 'Explore' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'analytics', label: 'Analytics' }
]

const SECONDARY_NAV: NavEntry[] = [
  { id: 'settings', label: 'Settings' },
  { id: 'about', label: 'About' }
]

/**
 * The navigation rail. No icons, no pills — a serif wordmark over uppercase
 * tracked links, emphasis carried by ink weight and a leading rule on the
 * active item. Two flat levels only.
 */
export function Sidebar(): JSX.Element {
  const view = useUiStore((s) => s.view)
  const setView = useUiStore((s) => s.setView)
  const openCommandPalette = useUiStore((s) => s.openCommandPalette)

  return (
    <nav
      aria-label="Primary"
      className="flex w-60 shrink-0 flex-col border-r border-surface-border px-8 py-9"
    >
      <div className="mb-10 flex items-center gap-3">
        <AnuraLogo size={26} />
        <div>
          <div className="display text-2xl leading-none tracking-display text-content-primary">
            EarthScope
          </div>
          <Eyebrow className="mt-1.5 text-[10px]">by Anura</Eyebrow>
        </div>
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        className="mb-8 flex items-baseline justify-between text-content-secondary hover-fade"
      >
        <span className="text-sm">Search events</span>
        <kbd className="font-sans text-2xs tracking-meta text-content-tertiary">⌘K</kbd>
      </button>

      <ul className="flex flex-col gap-1">
        {PRIMARY_NAV.map((entry) => (
          <NavRow key={entry.id} entry={entry} active={view === entry.id} onSelect={setView} />
        ))}
      </ul>

      <ul className="mt-auto flex flex-col gap-1 border-t border-surface-border pt-5">
        {SECONDARY_NAV.map((entry) => (
          <NavRow key={entry.id} entry={entry} active={view === entry.id} onSelect={setView} />
        ))}
      </ul>
    </nav>
  )
}

function NavRow({
  entry,
  active,
  onSelect
}: {
  entry: NavEntry
  active: boolean
  onSelect: (id: ViewId) => void
}): JSX.Element {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry.id)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center py-1.5 text-left text-[13px] tracking-meta transition-colors duration-200 ease-quiet',
          active ? 'text-content-primary' : 'text-content-secondary hover:text-content-primary'
        )}
        style={{ textTransform: 'uppercase' }}
      >
        {/* A short ink rule marks the active item — no pill, no fill. */}
        <span
          aria-hidden
          className={cn(
            'absolute -left-8 h-px w-4 bg-content-primary transition-opacity duration-200',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />
        {entry.label}
      </button>
    </li>
  )
}
