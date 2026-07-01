import { resolveCategoryMeta, type EventCategoryId } from '../models/category'
import { eventDurationMs, type NaturalEvent } from '../models/event'
import { continentOf } from '../utils/geo'
import { startOfUtcDay } from '../utils/time'

/**
 * Pure aggregation and analytics functions over collections of events.
 *
 * These are the app's core business logic and are deliberately UI-free so they
 * can be unit-tested in isolation (CLAUDE.md: "Core logic should be testable
 * independently of the UI").
 */

/** Remove duplicate events by id, preferring the most recently updated copy. */
export function dedupeEvents(events: readonly NaturalEvent[]): NaturalEvent[] {
  const byId = new Map<string, NaturalEvent>()
  for (const event of events) {
    const existing = byId.get(event.id)
    if (!existing || event.latestUpdate > existing.latestUpdate) {
      byId.set(event.id, event)
    }
  }
  return [...byId.values()]
}

export interface CategoryCount {
  readonly categoryId: EventCategoryId
  readonly label: string
  readonly color: string
  readonly count: number
}

/** Count events per category, sorted descending, skipping empty categories. */
export function countByCategory(events: readonly NaturalEvent[]): CategoryCount[] {
  const counts = new Map<EventCategoryId, number>()
  for (const event of events) {
    counts.set(event.categoryId, (counts.get(event.categoryId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([categoryId, count]) => {
      const meta = resolveCategoryMeta(categoryId)
      return { categoryId, label: meta.label, color: meta.color, count }
    })
    .sort((a, b) => b.count - a.count)
}

export interface NamedCount {
  readonly name: string
  readonly count: number
}

/** Count events per approximate continent. */
export function countByContinent(events: readonly NaturalEvent[]): NamedCount[] {
  const counts = new Map<string, number>()
  for (const event of events) {
    const name = continentOf(event.position)
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export interface TimeBucket {
  /** UTC midnight timestamp for the day. */
  readonly day: number
  readonly count: number
}

/**
 * Bucket events by their first-detected UTC day over the last `days` window,
 * filling gaps with zeroes so charts render a continuous axis.
 */
export function eventsOverTime(
  events: readonly NaturalEvent[],
  days = 30,
  now: number = Date.now()
): TimeBucket[] {
  const today = startOfUtcDay(new Date(now))
  const DAY_MS = 86_400_000
  const buckets = new Map<number, number>()
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(today - i * DAY_MS, 0)
  }
  for (const event of events) {
    const day = startOfUtcDay(new Date(event.firstDetected))
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1)
  }
  return [...buckets.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day - b.day)
}

export interface EventStats {
  readonly total: number
  readonly active: number
  readonly closed: number
  readonly averageDurationMs: number
  readonly byCategory: CategoryCount[]
  readonly byContinent: NamedCount[]
  readonly overTime: TimeBucket[]
  readonly recentlyClosed: NaturalEvent[]
}

/** Compute the full analytics summary in a single pass-friendly manner. */
export function computeStats(
  events: readonly NaturalEvent[],
  now: number = Date.now()
): EventStats {
  const active = events.filter((e) => e.isActive)
  const closed = events.filter((e) => !e.isActive)
  const totalDuration = events.reduce((sum, e) => sum + eventDurationMs(e, now), 0)

  const recentlyClosed = [...closed]
    .sort((a, b) => (b.closed ?? '').localeCompare(a.closed ?? ''))
    .slice(0, 8)

  return {
    total: events.length,
    active: active.length,
    closed: closed.length,
    averageDurationMs: events.length > 0 ? totalDuration / events.length : 0,
    byCategory: countByCategory(events),
    byContinent: countByContinent(events),
    overTime: eventsOverTime(events, 30, now),
    recentlyClosed
  }
}
