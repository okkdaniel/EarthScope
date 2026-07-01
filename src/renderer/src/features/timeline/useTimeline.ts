import { useEffect, useMemo, useRef, useState } from 'react'
import type { NaturalEvent } from '@shared/models/event'

const DAY_MS = 86_400_000

export interface TimelineController {
  min: number
  max: number
  cursor: number
  playing: boolean
  setCursor: (value: number) => void
  togglePlay: () => void
  /** Events active at the current cursor time. */
  visibleEvents: NaturalEvent[]
}

/**
 * Drives timeline scrubbing. The cursor sweeps from the earliest event to now;
 * playback advances it smoothly via requestAnimationFrame so the globe animates
 * between moments rather than jumping (CLAUDE.md: Timeline).
 */
export function useTimeline(events: NaturalEvent[], speedDaysPerSecond = 3): TimelineController {
  const bounds = useMemo(() => {
    if (events.length === 0) {
      const now = Date.now()
      return { min: now - 30 * DAY_MS, max: now }
    }
    let min = Infinity
    for (const event of events) {
      const t = new Date(event.firstDetected).getTime()
      if (t < min) min = t
    }
    // Clamp the window to a sensible 120-day span so the scrubber stays useful.
    const max = Date.now()
    return { min: Math.max(min, max - 120 * DAY_MS), max }
  }, [events])

  const [cursor, setCursor] = useState(bounds.max)
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)

  // Keep the cursor within bounds when the data window changes.
  useEffect(() => {
    setCursor((c) => Math.min(Math.max(c, bounds.min), bounds.max))
  }, [bounds.min, bounds.max])

  useEffect(() => {
    if (!playing) return
    lastTsRef.current = performance.now()

    const step = (ts: number): void => {
      const delta = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      setCursor((current) => {
        const next = current + delta * speedDaysPerSecond * DAY_MS
        if (next >= bounds.max) {
          setPlaying(false)
          return bounds.max
        }
        return next
      })
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [playing, bounds.max, speedDaysPerSecond])

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const start = new Date(event.firstDetected).getTime()
      const end = event.closed ? new Date(event.closed).getTime() : Date.now()
      return start <= cursor && cursor <= end
    })
  }, [events, cursor])

  const togglePlay = (): void => {
    setPlaying((p) => {
      // Restart from the beginning if we're at the end.
      if (!p && cursor >= bounds.max) setCursor(bounds.min)
      return !p
    })
  }

  return { ...bounds, cursor, playing, setCursor, togglePlay, visibleEvents }
}
