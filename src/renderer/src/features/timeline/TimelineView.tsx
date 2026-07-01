import { Globe } from '../explore/globe/Globe'
import { useTimeline } from './useTimeline'
import { useFilteredEvents } from '../../hooks/useFilteredEvents'
import { IconButton } from '../../components/ui/IconButton'
import { PlayGlyph, PauseGlyph } from '../../components/editorial/Glyph'
import { Eyebrow } from '../../components/editorial/Eyebrow'

const dateLabel = (ms: number): string =>
  new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

/**
 * The timeline workspace. The globe fills the view while a hairline-bordered
 * scrubber sweeps a time cursor; markers appear and fade as events become
 * active or resolve, so history plays back smoothly.
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
        <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-5 border border-content-primary bg-surface-base px-5 py-4">
          <IconButton
            label={timeline.playing ? 'Pause playback' : 'Play timeline'}
            onClick={timeline.togglePlay}
            className="text-content-primary"
          >
            {timeline.playing ? <PauseGlyph size={16} /> : <PlayGlyph size={16} />}
          </IconButton>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline justify-between text-2xs uppercase tracking-meta text-content-secondary">
              <span className="tabular">{dateLabel(timeline.min)}</span>
              <span className="tabular text-content-primary">{dateLabel(timeline.cursor)}</span>
              <span className="tabular">{dateLabel(timeline.max)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={timeline.min}
                max={timeline.max}
                value={timeline.cursor}
                onChange={(e) => timeline.setCursor(Number(e.target.value))}
                className="w-full accent-content-primary"
                aria-label="Timeline position"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-1/2 h-px -translate-y-1/2 bg-content-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Eyebrow className="w-20 shrink-0 text-right">
            <span className="tabular">{timeline.visibleEvents.length}</span> active
          </Eyebrow>
        </div>
      </div>
    </div>
  )
}
