import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'
import { eventDurationMs } from '@shared/models/event'
import { formatCoordinates } from '@shared/utils/geo'
import { formatDateTime, formatDuration, relativeTime } from '@shared/utils/time'
import { IconButton } from '../../components/ui/IconButton'
import { CategoryDot } from '../../components/common/CategoryDot'
import { Eyebrow } from '../../components/editorial/Eyebrow'
import { EditorialLink } from '../../components/editorial/EditorialLink'
import { MetaList } from '../../components/editorial/MetaList'
import { CloseGlyph } from '../../components/editorial/Glyph'
import { useBookmarkStore } from '../../state/bookmarkStore'
import { useUiStore } from '../../state/uiStore'

/**
 * The event detail panel — an opaque, hairline-bordered editorial column
 * anchored bottom-left so the globe stays the focus and stays interactive.
 * Information is grouped into ruled sections: Summary, Location, Timeline,
 * Updates, Resources. No card, no shadow, no icons beyond the drawn close mark.
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
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 18, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      className="pointer-events-auto absolute bottom-5 left-5 z-10 flex max-h-[calc(100%-2.5rem)] w-[360px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden border border-content-primary bg-surface-base"
      aria-label={`Details for ${event.title}`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-content-primary px-5 pb-4 pt-4">
        <div className="min-w-0">
          <Eyebrow className="flex items-center gap-2">
            <CategoryDot categoryId={event.categoryId} size={7} />
            {meta.label} · {event.isActive ? 'Active' : 'Closed'}
          </Eyebrow>
          <h2 className="display mt-2 text-2xl leading-tight text-content-primary">{event.title}</h2>
        </div>
        <IconButton label="Close details" onClick={() => selectEvent(null)}>
          <CloseGlyph />
        </IconButton>
      </header>

      <div className="flex items-center gap-5 border-b border-surface-border px-5 py-3 text-xs">
        <EditorialLink
          as="button"
          arrow
          underline={false}
          className="uppercase tracking-meta text-2xs"
          onClick={() => focusEvent(event.id)}
        >
          Fly to event
        </EditorialLink>
        <EditorialLink
          as="button"
          quiet={!bookmarked}
          underline={false}
          className="uppercase tracking-meta text-2xs"
          onClick={() => toggleBookmark(event.id)}
        >
          {bookmarked ? 'Saved' : 'Save'}
        </EditorialLink>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {event.description && (
          <Section title="Summary">
            <p className="selectable text-sm leading-relaxed text-content-secondary">
              {event.description}
            </p>
          </Section>
        )}

        <Section title="Location">
          <Row label="Coordinates" value={formatCoordinates(event.position)} />
        </Section>

        <Section title="Timeline">
          <Row label="First detected" value={formatDateTime(event.firstDetected)} />
          <Row label="Latest update" value={formatDateTime(event.latestUpdate)} />
          <Row label="Duration" value={formatDuration(eventDurationMs(event))} />
          {event.closed && <Row label="Closed" value={formatDateTime(event.closed)} />}
        </Section>

        {updates.length > 1 && (
          <Section title={`Updates · ${updates.length}`}>
            <ol className="space-y-2.5">
              {updates.slice(0, 12).map((geometry, index) => (
                <li key={`${geometry.date}-${index}`} className="border-b border-surface-border pb-2">
                  <p className="text-xs text-content-primary">{formatDateTime(geometry.date)}</p>
                  <MetaList
                    className="mt-0.5 text-2xs"
                    items={[
                      formatCoordinates(geometry.point),
                      geometry.magnitudeValue != null
                        ? `${geometry.magnitudeValue} ${geometry.magnitudeUnit ?? ''}`.trim()
                        : ''
                    ]}
                  />
                </li>
              ))}
            </ol>
          </Section>
        )}

        {(event.sources.length > 0 || event.link) && (
          <Section title="External resources">
            <div className="space-y-2">
              {event.sources.map((source) => (
                <div key={source.id}>
                  <EditorialLink href={source.url} target="_blank" rel="noreferrer" arrow className="text-xs">
                    {source.id}
                  </EditorialLink>
                </div>
              ))}
              {event.link && (
                <div>
                  <EditorialLink href={event.link} target="_blank" rel="noreferrer" arrow className="text-xs">
                    View on NASA EONET
                  </EditorialLink>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      <footer className="border-t border-surface-border px-5 py-2.5">
        <Eyebrow className="text-[10px]">
          NASA EONET · updated {relativeTime(event.latestUpdate)}
        </Eyebrow>
      </footer>
    </motion.aside>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <section>
      <Eyebrow className="mb-2.5">{title}</Eyebrow>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="text-content-secondary">{label}</span>
      <span className="selectable tabular text-right text-content-primary">{value}</span>
    </div>
  )
}
