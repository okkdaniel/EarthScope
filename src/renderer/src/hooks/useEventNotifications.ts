import { useEffect, useRef } from 'react'
import { resolveCategoryMeta } from '@shared/models/category'
import { client, hasBridge } from '../api/client'
import { useEvents } from './useEvents'
import { useSettingsStore } from '../state/settingsStore'

/**
 * Emits desktop notifications when new events appear in the user's chosen
 * categories. It diffs event ids between refetches, and the first successful
 * load only seeds the baseline (no burst of notifications on startup) — so users
 * are informed, never spammed (CLAUDE.md: Notifications).
 */
export function useEventNotifications(): void {
  const { data } = useEvents()
  const enabled = useSettingsStore((s) => s.settings.notificationsEnabled)
  const notifyCategories = useSettingsStore((s) => s.settings.notifyCategories)

  const seenIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!data?.events || !hasBridge()) return

    // Seed the baseline on the first load without notifying.
    if (seenIds.current === null) {
      seenIds.current = new Set(data.events.map((e) => e.id))
      return
    }

    if (!enabled || notifyCategories.length === 0) {
      seenIds.current = new Set(data.events.map((e) => e.id))
      return
    }

    const watched = new Set(notifyCategories)
    const fresh = data.events.filter(
      (event) =>
        event.isActive && !seenIds.current!.has(event.id) && watched.has(event.categoryId)
    )

    // Batch to avoid a flood; summarise when several arrive at once.
    if (fresh.length === 1) {
      const event = fresh[0]
      void client.showNotification({
        title: `New ${resolveCategoryMeta(event.categoryId).label.toLowerCase()} event`,
        body: event.title,
        eventId: event.id
      })
    } else if (fresh.length > 1) {
      void client.showNotification({
        title: `${fresh.length} new events detected`,
        body: fresh
          .slice(0, 3)
          .map((e) => e.title)
          .join(', ')
      })
    }

    seenIds.current = new Set(data.events.map((e) => e.id))
  }, [data, enabled, notifyCategories])
}
