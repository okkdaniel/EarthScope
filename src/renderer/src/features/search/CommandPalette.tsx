import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { rankEvents } from '@shared/services/search'
import { resolveCategoryMeta } from '@shared/models/category'
import { formatCoordinates } from '@shared/utils/geo'
import { CategoryDot } from '../../components/common/CategoryDot'
import { MetaList } from '../../components/editorial/MetaList'
import { useEvents } from '../../hooks/useEvents'
import { useUiStore, type ViewId } from '../../state/uiStore'
import { cn } from '../../utils/cn'

interface NavCommand {
  kind: 'nav'
  id: ViewId
  label: string
}

const NAV_COMMANDS: NavCommand[] = [
  { kind: 'nav', id: 'dashboard', label: 'Go to Dashboard' },
  { kind: 'nav', id: 'explore', label: 'Go to Explore' },
  { kind: 'nav', id: 'timeline', label: 'Go to Timeline' },
  { kind: 'nav', id: 'analytics', label: 'Go to Analytics' },
  { kind: 'nav', id: 'settings', label: 'Go to Settings' }
]

/**
 * A command palette (⌘K) in the editorial vocabulary: an opaque hairline-bordered
 * column over a quiet ink scrim (no blur, no shadow). Search events or jump
 * between views with full keyboard control.
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
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
      style={{ background: 'rgba(10, 10, 10, 0.24)' }}
      onClick={closeCommandPalette}
    >
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-xl overflow-hidden border border-content-primary bg-surface-base"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="border-b border-content-primary px-5">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search events or jump to…"
            className="h-14 w-full bg-transparent text-base text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {items.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-content-secondary">No results found.</p>
          ) : (
            items.map((item, index) => {
              const active = index === activeIndex
              if (item.type === 'nav') {
                return (
                  <Row
                    key={`nav-${item.command.id}`}
                    index={index}
                    active={active}
                    onHover={setActiveIndex}
                    onRun={runItem}
                  >
                    <span className="text-sm uppercase tracking-meta text-content-primary">
                      {item.command.label}
                    </span>
                  </Row>
                )
              }
              const event = item.event
              return (
                <Row
                  key={`event-${event.id}`}
                  index={index}
                  active={active}
                  onHover={setActiveIndex}
                  onRun={runItem}
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <CategoryDot categoryId={event.categoryId} size={6} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-content-primary">
                        {event.title}
                      </span>
                      <MetaList
                        className="text-2xs"
                        items={[
                          resolveCategoryMeta(event.categoryId).label,
                          formatCoordinates(event.position)
                        ]}
                      />
                    </span>
                  </span>
                </Row>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Row({
  index,
  active,
  onHover,
  onRun,
  children
}: {
  index: number
  active: boolean
  onHover: (index: number) => void
  onRun: (index: number) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <button
      data-index={index}
      onMouseMove={() => onHover(index)}
      onClick={() => onRun(index)}
      className={cn(
        'relative flex w-full items-center justify-between gap-3 px-5 py-2 text-left',
        active ? 'bg-surface-overlay' : ''
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-content-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0'
        )}
      />
      {children}
      {active && (
        <span aria-hidden className="shrink-0 text-content-tertiary">
          →
        </span>
      )}
    </button>
  )
}
