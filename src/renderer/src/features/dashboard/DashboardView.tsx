import { formatDuration } from '@shared/utils/time'
import { StatCard } from '../../components/common/StatCard'
import { ViewHeader } from '../../components/common/ViewHeader'
import { SectionHeading } from '../../components/editorial/SectionHeading'
import { EditorialLink } from '../../components/editorial/EditorialLink'
import { ContourMark } from '../../components/editorial/ContourMark'
import { Skeleton } from '../../components/ui/Skeleton'
import { EventListItem } from '../events/EventListItem'
import { CategoryBreakdown } from '../analytics/charts/CategoryBreakdown'
import { useEventStats } from '../../hooks/useEventStats'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { useUiStore } from '../../state/uiStore'

/**
 * The landing dashboard: a calm, at-a-glance ledger of global activity opening
 * onto the globe. First-time users understand what they're seeing at once.
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
    <div className="relative h-full overflow-y-auto">
      <ContourMark className="absolute right-0 top-0 w-[720px]" style={{ transform: 'translate(22%, -30%)' }} />

      <ViewHeader
        eyebrow="Live overview"
        title="Dashboard"
        subtitle="Natural events happening across Earth, right now."
        actions={
          <EditorialLink
            as="button"
            arrow
            underline={false}
            className="text-xs uppercase tracking-meta"
            onClick={() => setView('explore')}
          >
            Open globe
          </EditorialLink>
        }
      />

      <div className="relative space-y-14 px-10 pb-16 pt-10">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-8">
            <StatCard label="Active events" value={stats.active} hint={`${stats.total} tracked in total`} />
            <StatCard
              label="Top category"
              value={topCategory ? topCategory.count : 0}
              hint={topCategory ? topCategory.label : 'No activity'}
              accentColor={topCategory?.color}
            />
            <StatCard
              label="Continents affected"
              value={stats.byContinent.length}
              hint="Regions with active events"
            />
            <StatCard
              label="Average duration"
              value={formatDuration(stats.averageDurationMs)}
              hint="Across tracked events"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-12">
          <section className="col-span-2">
            <SectionHeading
              aside={
                <EditorialLink
                  as="button"
                  arrow
                  underline={false}
                  className="text-2xs uppercase tracking-meta"
                  onClick={() => setView('explore')}
                >
                  View all
                </EditorialLink>
              }
            >
              Recent activity
            </SectionHeading>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : notable.length === 0 ? (
              <p className="py-8 text-sm text-content-secondary">
                No active events match your filters.
              </p>
            ) : (
              <div>
                {notable.map((event) => (
                  <EventListItem key={event.id} event={event} onSelect={focusEvent} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading>By category</SectionHeading>
            <CategoryBreakdown data={stats.byCategory} />
          </section>
        </div>
      </div>
    </div>
  )
}
