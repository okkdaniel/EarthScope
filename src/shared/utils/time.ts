/**
 * Small, locale-aware time helpers. Kept dependency-light so they can be used
 * from the main process, preload and renderer alike.
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Human-friendly relative time, e.g. "3h ago", "just now", "in 2d". */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'unknown'
  const diff = then - now
  const abs = Math.abs(diff)
  const suffix = diff <= 0 ? 'ago' : 'from now'

  if (abs < MINUTE) return 'just now'
  if (abs < HOUR) return `${Math.round(abs / MINUTE)}m ${suffix}`
  if (abs < DAY) return `${Math.round(abs / HOUR)}h ${suffix}`
  const days = Math.round(abs / DAY)
  if (days < 30) return `${days}d ${suffix}`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ${suffix}`
  return `${Math.round(months / 12)}y ${suffix}`
}

/** Format a duration in milliseconds as a compact string, e.g. "5d 4h". */
export function formatDuration(ms: number): string {
  if (ms < MINUTE) return '< 1m'
  const days = Math.floor(ms / DAY)
  const hours = Math.floor((ms % DAY) / HOUR)
  const minutes = Math.floor((ms % HOUR) / MINUTE)
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  return `${minutes}m`
}

/** Absolute date formatting, e.g. "Jul 1, 2026, 14:32". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Truncate a Date to the start of its UTC day (for time-bucketed analytics). */
export function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}
