import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta } from '@shared/models/category'

/**
 * Client-side export helpers. Data exports (CSV/JSON) are generated in the
 * renderer and saved via an anchor download — no main-process round trip needed
 * for text payloads.
 */

function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

const CSV_HEADERS = [
  'id',
  'title',
  'category',
  'status',
  'latitude',
  'longitude',
  'firstDetected',
  'latestUpdate',
  'closed'
] as const

/** Export events as a CSV file. */
export function exportEventsCsv(events: readonly NaturalEvent[], filename = 'earthscope-events.csv'): void {
  const rows = events.map((event) =>
    [
      event.id,
      event.title,
      resolveCategoryMeta(event.categoryId).label,
      event.isActive ? 'active' : 'closed',
      event.position.latitude,
      event.position.longitude,
      event.firstDetected,
      event.latestUpdate,
      event.closed ?? ''
    ]
      .map(csvEscape)
      .join(',')
  )
  triggerDownload([CSV_HEADERS.join(','), ...rows].join('\n'), filename, 'text/csv')
}

/** Export the raw domain events as pretty-printed JSON. */
export function exportEventsJson(
  events: readonly NaturalEvent[],
  filename = 'earthscope-events.json'
): void {
  triggerDownload(JSON.stringify(events, null, 2), filename, 'application/json')
}
