import { Download, FileJson, CheckCircle2 } from 'lucide-react'
import { formatDuration, formatDateTime } from '@shared/utils/time'
import { ViewHeader } from '../../components/common/ViewHeader'
import { StatCard } from '../../components/common/StatCard'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { CategoryDot } from '../../components/common/CategoryDot'
import { CategoryBreakdown } from './charts/CategoryBreakdown'
import { EventsOverTimeChart } from './charts/EventsOverTimeChart'
import { ContinentChart } from './charts/ContinentChart'
import { useEventStats } from '../../hooks/useEventStats'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { exportEventsCsv, exportEventsJson } from '../../utils/export'

/**
 * The analytics dashboard. Summarises the active event set across categories,
 * regions and time, and offers CSV/JSON export of the underlying data.
 */
export function AnalyticsView(): JSX.Element {
  const { stats, isLoading } = useEventStats()
  const { filtered } = useFilteredEvents()

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader
        title="Analytics"
        subtitle="Trends and distributions across the current event set."
        actions={
          <>
            <Button size="sm" onClick={() => exportEventsCsv(filtered)}>
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> CSV
            </Button>
            <Button size="sm" onClick={() => exportEventsJson(filtered)}>
              <FileJson className="h-3.5 w-3.5" strokeWidth={1.75} /> JSON
            </Button>
          </>
        }
      />

      <div className="space-y-6 px-8 pb-10">
        {isLoading ? (
          <Skeleton className="h-24 rounded-2xl" />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total events" value={stats.total} />
            <StatCard label="Active" value={stats.active} accent="#3fd6d6" />
            <StatCard label="Resolved" value={stats.closed} />
            <StatCard label="Avg. duration" value={formatDuration(stats.averageDurationMs)} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <section className="col-span-2 panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-content-primary">
              New events over time
            </h2>
            <EventsOverTimeChart data={stats.overTime} />
          </section>
          <section className="panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-content-primary">By category</h2>
            <CategoryBreakdown data={stats.byCategory} />
          </section>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <section className="panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-content-primary">By continent</h2>
            <ContinentChart data={stats.byContinent} />
          </section>
          <section className="panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-content-primary">Recently resolved</h2>
            {stats.recentlyClosed.length === 0 ? (
              <p className="py-6 text-center text-sm text-content-tertiary">
                No recently resolved events.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {stats.recentlyClosed.map((event) => (
                  <li key={event.id} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-content-tertiary" strokeWidth={1.75} />
                    <CategoryDot categoryId={event.categoryId} size={7} />
                    <span className="min-w-0 flex-1 truncate text-sm text-content-secondary">
                      {event.title}
                    </span>
                    <span className="shrink-0 text-2xs text-content-tertiary">
                      {event.closed ? formatDateTime(event.closed) : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
