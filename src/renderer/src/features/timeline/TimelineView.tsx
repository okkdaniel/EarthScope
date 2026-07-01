import { Play, Pause } from 'lucide-react'
import { Globe } from '../explore/globe/Globe'
import { useTimeline } from './useTimeline'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { IconButton } from '../../components/ui/IconButton'

const dateLabel = (ms: number): string =>
  new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

/**
 * The timeline workspace. The globe fills the view while a scrubber along the
 * bottom sweeps a time cursor; markers appear and fade as events become active
 * or resolve, so history plays back smoothly.
 */
export function TimelineView(): JSX.Element {
  const { all } = useFilteredEvents()
  const timeline = useTimeline(all)

  const progress =
    timeline.max > timeline.min
      ? ((timeline.cursor - timeline.min) / (timeline.max - timeline.min)) * 100
      : 100

  return (
    <div className="relative h-full">
      <Globe events={timeline.visibleEvents} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
        <div className="pointer-events-auto mx-auto max-w-3xl panel shadow-panel">
          <div className="flex items-center gap-4 p-4">
            <IconButton
              label={timeline.playing ? 'Pause playback' : 'Play timeline'}
              onClick={timeline.togglePlay}
              className="bg-accent text-white hover:bg-accent/90 hover:text-white"
            >
              {timeline.playing ? (
                <Pause className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Play className="h-4 w-4" strokeWidth={2} />
              )}
            </IconButton>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between text-2xs text-content-tertiary">
                <span>{dateLabel(timeline.min)}</span>
                <span className="font-medium text-content-primary">
                  {dateLabel(timeline.cursor)}
                </span>
                <span>{dateLabel(timeline.max)}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={timeline.min}
                  max={timeline.max}
                  value={timeline.cursor}
                  onChange={(e) => timeline.setCursor(Number(e.target.value))}
                  className="w-full accent-accent"
                  aria-label="Timeline position"
                />
                <div
                  className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent/40"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="w-24 shrink-0 text-right text-xs text-content-secondary">
              {timeline.visibleEvents.length} active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
