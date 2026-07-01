import { useMemo, useState } from 'react'
import type { NaturalEvent } from '@shared/models/event'
import { resolveCategoryMeta, type EventCategoryId } from '@shared/models/category'
import { EventListItem } from '../events/EventListItem'
import { ChevronGlyph } from '../../components/editorial/Glyph'
import { useFilterStore } from '../../state/filterStore'
import { cn } from '../../utils/cn'

interface EventGroupListProps {
  events: NaturalEvent[]
  selectedId: string | null
  onSelect: (id: string) => void
}

interface Group {
  categoryId: EventCategoryId
  label: string
  color: string
  events: NaturalEvent[]
}

/** Below this many total events, everything is expanded — grouping only helps at scale. */
const AUTO_EXPAND_LIMIT = 12

/**
 * Mirrors the globe's clustering in the sidebar: instead of a long flat list,
 * events are grouped by category into collapsible sections with counts. Groups
 * auto-expand when it aids scanning (few events, a single group, an active
 * search, or the group holding the current selection). Selecting a child flies
 * the globe to that specific event.
 */
export function EventGroupList({ events, selectedId, onSelect }: EventGroupListProps): JSX.Element {
  const query = useFilterStore((s) => s.query)
  const [overrides, setOverrides] = useState<Partial<Record<EventCategoryId, boolean>>>({})

  const groups = useMemo<Group[]>(() => {
    const byCategory = new Map<EventCategoryId, NaturalEvent[]>()
    for (const event of events) {
      const list = byCategory.get(event.categoryId) ?? []
      list.push(event)
      byCategory.set(event.categoryId, list)
    }
    return [...byCategory.entries()]
      .map(([categoryId, groupEvents]) => {
        const meta = resolveCategoryMeta(categoryId)
        return {
          categoryId,
          label: meta.label,
          color: meta.color,
          events: groupEvents.sort((a, b) => b.latestUpdate.localeCompare(a.latestUpdate))
        }
      })
      .sort((a, b) => b.events.length - a.events.length || a.label.localeCompare(b.label))
  }, [events])

  const searching = query.trim().length > 0
  const smallSet = events.length <= AUTO_EXPAND_LIMIT
  const singleGroup = groups.length === 1

  const isOpen = (group: Group): boolean => {
    const override = overrides[group.categoryId]
    if (override !== undefined) return override
    return (
      smallSet ||
      singleGroup ||
      searching ||
      group.events.some((event) => event.id === selectedId)
    )
  }

  const toggle = (group: Group): void =>
    setOverrides((prev) => ({ ...prev, [group.categoryId]: !isOpen(group) }))

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const open = isOpen(group)
        return (
          <div key={group.categoryId}>
            <button
              type="button"
              onClick={() => toggle(group)}
              aria-expanded={open}
              className="flex w-full items-center gap-2.5 border-b border-content-primary py-2 text-left"
            >
              <ChevronGlyph
                size={12}
                className={cn(
                  'shrink-0 text-content-secondary transition-transform duration-200 ease-quiet',
                  open && 'rotate-90'
                )}
              />
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: group.color }}
                aria-hidden
              />
              <span className="flex-1 text-xs uppercase tracking-meta text-content-primary">
                {group.label}
              </span>
              <span className="tabular text-2xs text-content-secondary">{group.events.length}</span>
            </button>

            {open && (
              <div className="pl-1">
                {group.events.map((event) => (
                  <EventListItem
                    key={event.id}
                    event={event}
                    selected={event.id === selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
