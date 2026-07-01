import { formatDuration, formatDateTime } from '@shared/utils/time'
import { ViewHeader } from '../../components/common/ViewHeader'
import { StatCard } from '../../components/common/StatCard'
import { SectionHeading } from '../../components/editorial/SectionHeading'
import { EditorialLink } from '../../components/editorial/EditorialLink'
import { MetaList } from '../../components/editorial/MetaList'
import { Skeleton } from '../../components/ui/Skeleton'
import { CategoryDot } from '../../components/common/CategoryDot'
import { CategoryBreakdown } from './charts/CategoryBreakdown'
import { EventsOverTimeChart } from './charts/EventsOverTimeChart'
import { ContinentChart } from './charts/ContinentChart'
import { useEventStats } from '../../hooks/useEventStats'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { exportEventsCsv, exportEventsJson } from '../../utils/export'

/**
 * The analytics ledger. Distributions across categories, regions and time,
 * with CSV/JSON export — rendered monochrome, grouped by rule not by card.
 */
export function AnalyticsView(): JSX.Element {
  const { stats, isLoading } = useEventStats()
  const { filtered } = useFilteredEvents()

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader
        eyebrow="Analysis"
        title="Analytics"
        subtitle="Distributions across the current event set."
        actions={
          <>
            <EditorialLink
              as="button"
              className="text-2xs uppercase tracking-meta"
              onClick={() => exportEventsCsv(filtered)}
            >
              Export CSV
            </EditorialLink>
            <EditorialLink
              as="button"
              className="text-2xs uppercase tracking-meta"
              onClick={() => exportEventsJson(filtered)}
            >
              Export JSON
            </EditorialLink>
          </>
        }
      />

      <div className="space-y-14 px-10 pb-16 pt-10">
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="grid grid-cols-4 gap-8">
            <StatCard label="Total events" value={stats.total} />
            <StatCard label="Active" value={stats.active} />
            <StatCard label="Resolved" value={stats.closed} />
            <StatCard label="Average duration" value={formatDuration(stats.averageDurationMs)} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-12">
          <section className="col-span-2">
            <SectionHeading>New events over time</SectionHeading>
            <EventsOverTimeChart data={stats.overTime} />
          </section>
          <section>
            <SectionHeading>By category</SectionHeading>
            <CategoryBreakdown data={stats.byCategory} />
          </section>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <section>
            <SectionHeading>By continent</SectionHeading>
            <ContinentChart data={stats.byContinent} />
          </section>
          <section>
            <SectionHeading>Recently resolved</SectionHeading>
            {stats.recentlyClosed.length === 0 ? (
              <p className="py-6 text-sm text-content-secondary">No recently resolved events.</p>
            ) : (
              <div>
                {stats.recentlyClosed.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-baseline justify-between gap-4 border-b border-surface-border py-2.5"
                  >
                    <span className="flex min-w-0 items-baseline gap-2 text-sm text-content-primary">
                      <CategoryDot categoryId={event.categoryId} size={6} />
                      <span className="truncate">{event.title}</span>
                    </span>
                    <MetaList
                      className="shrink-0 text-2xs"
                      items={[event.closed ? formatDateTime(event.closed) : '']}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
