import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Globe2,
  LayoutDashboard,
  Clock,
  BarChart3,
  Settings,
  CornerDownLeft
} from 'lucide-react'
import { rankEvents } from '@shared/services/search'
import { resolveCategoryMeta } from '@shared/models/category'
import { formatCoordinates } from '@shared/utils/geo'
import { CategoryDot } from '../../components/common/CategoryDot'
import { useEvents } from '../../hooks/useEvents'
import { useUiStore, type ViewId } from '../../state/uiStore'
import { cn } from '../../utils/cn'

interface NavCommand {
  kind: 'nav'
  id: ViewId
  label: string
  icon: typeof Globe2
}

const NAV_COMMANDS: NavCommand[] = [
  { kind: 'nav', id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard },
  { kind: 'nav', id: 'explore', label: 'Go to Explore', icon: Globe2 },
  { kind: 'nav', id: 'timeline', label: 'Go to Timeline', icon: Clock },
  { kind: 'nav', id: 'analytics', label: 'Go to Analytics', icon: BarChart3 },
  { kind: 'nav', id: 'settings', label: 'Go to Settings', icon: Settings }
]

/**
 * A Raycast/Linear-style command palette (⌘K). Searches events and offers quick
 * navigation, with full keyboard control. Selecting an event flies the globe to
 * it; selecting a command switches views.
 */
export function CommandPalette(): JSX.Element {
  const query = useEvents()
  const closeCommandPalette = useUiStore((s) => s.closeCommandPalette)
  const focusEvent = useUiStore((s) => s.focusEvent)
  const setView = useUiStore((s) => s.setView)

  const [text, setText] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  const events = useMemo(() => query.data?.events ?? [], [query.data])

  const matchedEvents = useMemo(() => rankEvents(events, text, 8), [events, text])
  const matchedNav = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (!q) return NAV_COMMANDS
    return NAV_COMMANDS.filter((c) => c.label.toLowerCase().includes(q))
  }, [text])

  const items = useMemo(
    () => [
      ...matchedNav.map((command) => ({ type: 'nav' as const, command })),
      ...matchedEvents.map((event) => ({ type: 'event' as const, event }))
    ],
    [matchedNav, matchedEvents]
  )

  useEffect(() => setActiveIndex(0), [text])

  const runItem = (index: number): void => {
    const item = items[index]
    if (!item) return
    if (item.type === 'nav') setView(item.command.id)
    else focusEvent(item.event.id)
    closeCommandPalette()
  }

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runItem(activeIndex)
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]"
      onClick={closeCommandPalette}
    >
      <motion.div
        initial={{ scale: 0.98, y: -8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.98, y: -8, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl overflow-hidden panel shadow-overlay"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-surface-border px-4">
          <Search className="h-4 w-4 text-content-tertiary" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search events or jump to…"
            className="h-12 flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-content-tertiary">No results found.</p>
          ) : (
            items.map((item, index) => {
              const active = index === activeIndex
              if (item.type === 'nav') {
                const Icon = item.command.icon
                return (
                  <button
                    key={`nav-${item.command.id}`}
                    data-index={index}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => runItem(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                      active ? 'bg-surface-hover text-content-primary' : 'text-content-secondary'
                    )}
                  >
                    <Icon className="h-4 w-4 text-content-tertiary" strokeWidth={1.75} />
                    {item.command.label}
                    {active && (
                      <CornerDownLeft className="ml-auto h-3.5 w-3.5 text-content-tertiary" />
                    )}
                  </button>
                )
              }
              const event = item.event
              return (
                <button
                  key={`event-${event.id}`}
                  data-index={index}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => runItem(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left',
                    active ? 'bg-surface-hover' : ''
                  )}
                >
                  <CategoryDot categoryId={event.categoryId} size={9} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-content-primary">{event.title}</p>
                    <p className="truncate text-2xs text-content-tertiary">
                      {resolveCategoryMeta(event.categoryId).label} ·{' '}
                      {formatCoordinates(event.position)}
                    </p>
                  </div>
                  {active && <CornerDownLeft className="h-3.5 w-3.5 text-content-tertiary" />}
                </button>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
