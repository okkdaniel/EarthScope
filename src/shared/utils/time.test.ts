import { describe, expect, it } from 'vitest'
import { formatDuration, relativeTime, startOfUtcDay } from './time'

describe('relativeTime', () => {
  const now = Date.UTC(2026, 5, 30, 12, 0, 0)

  it('reports recent times as "just now"', () => {
    expect(relativeTime(new Date(now - 30_000).toISOString(), now)).toBe('just now')
  })

  it('reports hours ago', () => {
    expect(relativeTime(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h ago')
  })

  it('reports days ago', () => {
    expect(relativeTime(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe('2d ago')
  })

  it('handles invalid input gracefully', () => {
    expect(relativeTime('not-a-date', now)).toBe('unknown')
  })
})

describe('formatDuration', () => {
  it('formats sub-minute durations', () => {
    expect(formatDuration(30_000)).toBe('< 1m')
  })

  it('formats days and hours', () => {
    expect(formatDuration(2 * 86_400_000 + 5 * 3_600_000)).toBe('2d 5h')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3 * 3_600_000 + 20 * 60_000)).toBe('3h 20m')
  })
})

describe('startOfUtcDay', () => {
  it('truncates to UTC midnight', () => {
    const truncated = startOfUtcDay(new Date('2026-06-30T18:45:00Z'))
    expect(new Date(truncated).toISOString()).toBe('2026-06-30T00:00:00.000Z')
  })
})
