import { resolveCategoryMeta, type EventCategoryId } from '../models/category'
import type { NaturalEvent } from '../models/event'
import { continentOf } from '../utils/geo'

/**
 * Client-side event filtering and search.
 *
 * Kept pure and synchronous so it can drive instant filtering (CLAUDE.md:
 * "Instant filtering") without a round-trip, and be unit-tested directly.
 */

export interface EventFilter {
  /** Enabled category ids. When empty, all categories are shown. */
  readonly categories: ReadonlySet<EventCategoryId>
  /** Free-text query across title, category and continent. */
  readonly query: string
  /** Show only active events. */
  readonly activeOnly: boolean
}

export const EMPTY_FILTER: EventFilter = {
  categories: new Set(),
  query: '',
  activeOnly: false
}

/** Apply category, status and text filters, preserving input order. */
export function filterEvents(
  events: readonly NaturalEvent[],
  filter: EventFilter
): NaturalEvent[] {
  const normalizedQuery = filter.query.trim().toLowerCase()
  const hasCategoryFilter = filter.categories.size > 0

  return events.filter((event) => {
    if (filter.activeOnly && !event.isActive) return false
    if (hasCategoryFilter && !event.categoryIds.some((c) => filter.categories.has(c))) {
      return false
    }
    if (normalizedQuery.length > 0 && !matchesQuery(event, normalizedQuery)) return false
    return true
  })
}

function matchesQuery(event: NaturalEvent, query: string): boolean {
  if (event.title.toLowerCase().includes(query)) return true
  const categoryLabel = resolveCategoryMeta(event.categoryId).label.toLowerCase()
  if (categoryLabel.includes(query)) return true
  if (continentOf(event.position).toLowerCase().includes(query)) return true
  return false
}

export interface RankedEvent {
  readonly event: NaturalEvent
  readonly score: number
}

/**
 * Rank events for the search palette. Higher score = better match.
 * Prefixes and title matches outrank category/continent matches.
 */
export function rankEvents(
  events: readonly NaturalEvent[],
  rawQuery: string,
  limit = 20
): NaturalEvent[] {
  const query = rawQuery.trim().toLowerCase()
  if (query.length === 0) {
    // No query: surface the most recently updated active events.
    return [...events]
      .sort((a, b) => b.latestUpdate.localeCompare(a.latestUpdate))
      .slice(0, limit)
  }

  const ranked: RankedEvent[] = []
  for (const event of events) {
    const title = event.title.toLowerCase()
    let score = 0
    if (title === query) score = 100
    else if (title.startsWith(query)) score = 80
    else if (title.includes(query)) score = 60
    else if (resolveCategoryMeta(event.categoryId).label.toLowerCase().includes(query)) score = 30
    else if (continentOf(event.position).toLowerCase().includes(query)) score = 20

    if (score > 0) ranked.push({ event, score })
  }

  return ranked
    .sort((a, b) => b.score - a.score || b.event.latestUpdate.localeCompare(a.event.latestUpdate))
    .slice(0, limit)
    .map((r) => r.event)
}
