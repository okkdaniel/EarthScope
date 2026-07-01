import { isEventCategoryId, type EventCategoryId } from '../../models/category'
import type { EventGeometry, NaturalEvent } from '../../models/event'
import { isLngLat, type GeoPoint, type LngLat } from '../../models/geo'
import { centroidOf } from '../../utils/geo'
import type { EonetEvent, EonetGeometry } from './eonet.types'

export const EONET_PROVIDER_ID = 'nasa-eonet'

/**
 * Map a raw EONET event into the canonical {@link NaturalEvent} model.
 *
 * Returns `null` when the event cannot be meaningfully represented (no valid
 * geometry), so callers can filter it out rather than render a broken marker.
 * Every field access is defensive: the EONET feed occasionally emits partial
 * records, and a single bad event must never break the whole batch.
 */
export function mapEonetEvent(raw: EonetEvent): NaturalEvent | null {
  const rawGeometries = raw.geometry ?? raw.geometries ?? []
  const geometries = rawGeometries
    .map(mapGeometry)
    .filter((g): g is EventGeometry => g !== null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (geometries.length === 0) return null

  const categoryIds = extractCategoryIds(raw)
  if (categoryIds.length === 0) return null

  const latest = geometries[geometries.length - 1]
  const first = geometries[0]

  return {
    id: raw.id,
    title: raw.title?.trim() || 'Untitled event',
    description: raw.description?.trim() || null,
    link: raw.link ?? null,
    categoryId: categoryIds[0],
    categoryIds,
    closed: raw.closed ?? null,
    isActive: !raw.closed,
    sources: (raw.sources ?? []).filter((s) => s?.url).map((s) => ({ id: s.id, url: s.url })),
    geometries,
    firstDetected: first.date,
    latestUpdate: latest.date,
    position: latest.point,
    providerId: EONET_PROVIDER_ID
  }
}

function extractCategoryIds(raw: EonetEvent): EventCategoryId[] {
  const ids: EventCategoryId[] = []
  for (const category of raw.categories ?? []) {
    if (category?.id && isEventCategoryId(category.id) && !ids.includes(category.id)) {
      ids.push(category.id)
    }
  }
  return ids
}

function mapGeometry(raw: EonetGeometry): EventGeometry | null {
  if (!raw?.date) return null

  const point = extractPoint(raw)
  if (!point) return null

  const type = raw.type === 'Polygon' ? 'Polygon' : 'Point'
  const geometry: EventGeometry = {
    date: raw.date,
    type,
    point,
    ...(typeof raw.magnitudeValue === 'number' ? { magnitudeValue: raw.magnitudeValue } : {}),
    ...(raw.magnitudeUnit ? { magnitudeUnit: raw.magnitudeUnit } : {}),
    ...(type === 'Polygon' ? { coordinates: extractPolygonRing(raw.coordinates) } : {})
  }
  return geometry
}

/** Resolve a representative point for either a Point or Polygon geometry. */
function extractPoint(raw: EonetGeometry): GeoPoint | null {
  if (raw.type === 'Polygon') {
    const ring = extractPolygonRing(raw.coordinates)
    return ring.length > 0 ? centroidOf(ring) : null
  }
  if (isLngLat(raw.coordinates)) {
    const [longitude, latitude] = raw.coordinates
    return withinBounds(latitude, longitude) ? { latitude, longitude } : null
  }
  return null
}

/** Flatten an EONET polygon coordinate structure to its outer ring. */
function extractPolygonRing(coordinates: unknown): LngLat[] {
  // EONET polygons are `[[[lng, lat], ...]]`; take the first (outer) ring.
  if (!Array.isArray(coordinates)) return []
  const outer = coordinates[0]
  if (!Array.isArray(outer)) return []
  return outer.filter(isLngLat) as LngLat[]
}

function withinBounds(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
