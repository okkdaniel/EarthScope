import { Color } from 'three'
import { resolveCategoryMeta, type EventVisual } from '@shared/models/category'

/**
 * Maps each category's {@link EventVisual} to a numeric id understood by the
 * marker shader, plus a base size. The shader uses the id to select a distinct
 * animated "visual language" per category (flicker, ripple, spiral, …) so event
 * types are recognisable without labels (CLAUDE.md: Event Visualization).
 */
export const VISUAL_ID: Record<EventVisual, number> = {
  wildfire: 0,
  volcano: 1,
  storm: 2,
  flood: 3,
  seaice: 4,
  dust: 5,
  earthquake: 6,
  landslide: 7,
  snow: 8,
  drought: 9,
  temperature: 10,
  water: 11,
  other: 12
}

const BASE_SIZE: Partial<Record<EventVisual, number>> = {
  wildfire: 22,
  volcano: 24,
  storm: 30,
  flood: 22,
  seaice: 20,
  dust: 22
}

const DEFAULT_SIZE = 20

export interface MarkerVisual {
  color: Color
  visualId: number
  size: number
}

const colorCache = new Map<string, Color>()

/** Resolve the shader inputs for an event's primary category. */
export function markerVisualFor(categoryId: string): MarkerVisual {
  const meta = resolveCategoryMeta(categoryId)
  let color = colorCache.get(meta.color)
  if (!color) {
    color = new Color(meta.color)
    colorCache.set(meta.color, color)
  }
  return {
    color,
    visualId: VISUAL_ID[meta.visual],
    size: BASE_SIZE[meta.visual] ?? DEFAULT_SIZE
  }
}
