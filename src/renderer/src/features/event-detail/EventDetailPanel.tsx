import { motion } from 'framer-motion'
import { X, MapPin, Clock, ExternalLink, Star, Crosshair } from 'lucide-react'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { eventDurationMs } from '@shared/models/event'
import { formatCoordinates } from '@shared/utils/geo'
import { formatDateTime, formatDuration, relativeTime } from '@shared/utils/time'
import { IconButton } from '../../components/ui/IconButton'
import { CategoryDot } from '../../components/common/CategoryDot'
import { useBookmarkStore } from '../../state/bookmarkStore'
import { useUiStore } from '../../state/uiStore'
import { cn } from '../../utils/cn'

/**
 * The event detail panel. Information is grouped into clear sections — Summary,
 * Location, Timeline, Updates, Resources — so a user is never overwhelmed
 * (CLAUDE.md: Event Detail Panel).
 */
export function EventDetailPanel({ event }: { event: NaturalEvent }): JSX.Element {
  const meta = resolveCategoryMeta(event.categoryId)
  const selectEvent = useUiStore((s) => s.selectEvent)
  const focusEvent = useUiStore((s) => s.focusEvent)
  const bookmarked = useBookmarkStore((s) => s.ids.includes(event.id))
  const toggleBookmark = useBookmarkStore((s) => s.toggle)

  const updates = [...event.geometries].reverse()

  return (
    <motion.aside
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute right-4 top-4 bottom-4 z-10 flex w-[360px] flex-col overflow-hidden panel shadow-panel"
      aria-label={`Details for ${event.title}`}
    >
      <header className="flex items-start gap-3 border-b border-surface-border p-4">
        <CategoryDot categoryId={event.categoryId} size={10} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-tight text-content-primary">
            {event.title}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-content-secondary">
            <span>{meta.label}</span>
            <span aria-hidden>·</span>
            <StatusPill active={event.isActive} />
          </div>
        </div>
        <IconButton label="Close details" onClick={() => selectEvent(null)}>
          <X className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </header>

      <div className="flex items-center gap-2 border-b border-surface-border p-3">
        <button
          type="button"
          onClick={() => focusEvent(event.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
        >
          <Crosshair className="h-3.5 w-3.5" strokeWidth={2} />
          Fly to event
        </button>
        <IconButton
          label={bookmarked ? 'Remove bookmark' : 'Bookmark event'}
          active={bookmarked}
          onClick={() => toggleBookmark(event.id)}
        >
          <Star
            className={cn('h-4 w-4', bookmarked && 'fill-amber-400 text-amber-400')}
            strokeWidth={1.75}
          />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {event.description && (
          <Section title="Summary">
            <p className="selectable text-sm leading-relaxed text-content-secondary">
              {event.description}
            </p>
          </Section>
        )}

        <Section title="Location">
          <Row icon={MapPin} label="Coordinates" value={formatCoordinates(event.position)} />
        </Section>

        <Section title="Timeline">
          <Row icon={Clock} label="First detected" value={formatDateTime(event.firstDetected)} />
          <Row icon={Clock} label="Latest update" value={formatDateTime(event.latestUpdate)} />
          <Row
            icon={Clock}
            label="Duration"
            value={formatDuration(eventDurationMs(event))}
          />
          {event.closed && (
            <Row icon={Clock} label="Closed" value={formatDateTime(event.closed)} />
          )}
        </Section>

        {updates.length > 1 && (
          <Section title={`Updates (${updates.length})`}>
            <ol className="space-y-2">
              {updates.slice(0, 12).map((geometry, index) => (
                <li key={`${geometry.date}-${index}`} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-surface-border" />
                  <div className="min-w-0">
                    <p className="text-xs text-content-secondary">
                      {formatDateTime(geometry.date)}
                    </p>
                    <p className="text-2xs text-content-tertiary">
                      {formatCoordinates(geometry.point)}
                      {geometry.magnitudeValue != null &&
                        ` · ${geometry.magnitudeValue} ${geometry.magnitudeUnit ?? ''}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {event.sources.length > 0 && (
          <Section title="External Resources">
            <div className="space-y-1.5">
              {event.sources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-accent transition-colors hover:bg-surface-hover"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="truncate">{source.id}</span>
                </a>
              ))}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-accent transition-colors hover:bg-surface-hover"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                  View on NASA EONET
                </a>
              )}
            </div>
          </Section>
        )}
      </div>

      <footer className="border-t border-surface-border p-3 text-2xs text-content-tertiary">
        Source: NASA EONET · last update {relativeTime(event.latestUpdate)}
      </footer>
    </motion.aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section>
      <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-content-tertiary">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Row({
  icon: Icon,
  label,
  value
}: {
  icon: typeof MapPin
  label: string
  value: string
}): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-content-tertiary" strokeWidth={1.75} />
      <span className="text-xs text-content-tertiary">{label}</span>
      <span className="selectable ml-auto text-xs text-content-primary">{value}</span>
    </div>
  )
}

function StatusPill({ active }: { active: boolean }): JSX.Element {
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-0.5 text-2xs font-medium',
        active ? 'bg-emerald-400/15 text-emerald-300' : 'bg-surface-hover text-content-tertiary'
      )}
    >
      {active ? 'Active' : 'Closed'}
    </span>
  )
}
