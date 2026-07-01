import { Activity, Flame, Globe2, Clock, ArrowRight } from 'lucide-react'
import { formatDuration } from '@shared/utils/time'
import { StatCard } from '../../components/common/StatCard'
import { ViewHeader } from '../../components/common/ViewHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { EventListItem } from '../events/EventListItem'
import { CategoryBreakdown } from '../analytics/charts/CategoryBreakdown'
import { useEventStats } from '../../hooks/useEventStats'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { useUiStore } from '../../state/uiStore'

/**
 * The landing dashboard: a calm, at-a-glance summary of global activity with a
 * clear path into the globe. A first-time user immediately understands what
 * they're looking at (CLAUDE.md: User Experience).
 */
export function DashboardView(): JSX.Element {
  const { stats, isLoading } = useEventStats()
  const { filtered } = useFilteredEvents()
  const focusEvent = useUiStore((s) => s.focusEvent)
  const setView = useUiStore((s) => s.setView)

  const notable = [...filtered]
    .filter((e) => e.isActive)
    .sort((a, b) => b.latestUpdate.localeCompare(a.latestUpdate))
    .slice(0, 6)

  const topCategory = stats.byCategory[0]

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader
        title="Dashboard"
        subtitle="A live overview of natural events happening across Earth right now."
        actions={
          <button
            type="button"
            onClick={() => setView('explore')}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            <Globe2 className="h-3.5 w-3.5" strokeWidth={2} />
            Open globe
          </button>
        }
      />

      <div className="space-y-6 px-8 pb-10">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Active events"
              value={stats.active}
              hint={`${stats.total} tracked in total`}
              icon={Activity}
              accent="#3fd6d6"
            />
            <StatCard
              label="Top category"
              value={topCategory ? topCategory.count : 0}
              hint={topCategory ? topCategory.label : 'No activity'}
              icon={Flame}
              accent={topCategory?.color}
            />
            <StatCard
              label="Continents affected"
              value={stats.byContinent.length}
              hint="Regions with active events"
              icon={Globe2}
            />
            <StatCard
              label="Avg. duration"
              value={formatDuration(stats.averageDurationMs)}
              hint="Across tracked events"
              icon={Clock}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <section className="col-span-2 panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-content-primary">Recent activity</h2>
              <button
                type="button"
                onClick={() => setView('explore')}
                className="flex items-center gap-1 text-xs text-accent transition-colors hover:text-accent/80"
              >
                View all <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : notable.length === 0 ? (
              <p className="py-8 text-center text-sm text-content-tertiary">
                No active events match your filters.
              </p>
            ) : (
              <div className="space-y-0.5">
                {notable.map((event) => (
                  <EventListItem key={event.id} event={event} onSelect={focusEvent} />
                ))}
              </div>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-semibold text-content-primary">By category</h2>
            <CategoryBreakdown data={stats.byCategory} />
          </section>
        </div>
      </div>
    </div>
  )
}
