import type { EventCategoryId } from './category'
import type { GeoPoint, LngLat } from './geo'

/**
 * The EarthScope domain model for a natural event.
 *
 * This is provider-agnostic: EONET, wildfire hotspot feeds, earthquake feeds
 * etc. all normalise into this shape. UI and rendering code should depend only
 * on this model, never on a provider's raw response.
 */

/** A single positioned observation belonging to an event's timeline. */
export interface EventGeometry {
  /** ISO-8601 timestamp of the observation. */
  readonly date: string
  /** Geometry footprint type as reported by the source. */
  readonly type: 'Point' | 'Polygon'
  /** Representative point (polygon centroid for polygons). */
  readonly point: GeoPoint
  /** Optional measured magnitude (e.g. wildfire radiative power, storm wind). */
  readonly magnitudeValue?: number
  readonly magnitudeUnit?: string
  /** Raw coordinates for polygon rendering, if applicable. */
  readonly coordinates?: LngLat[]
}

/** An external reference (satellite imagery, agency bulletin, etc.). */
export interface EventSource {
  readonly id: string
  readonly url: string
}

export interface NaturalEvent {
  readonly id: string
  readonly title: string
  readonly description: string | null
  /** Canonical link back to the source record. */
  readonly link: string | null
  /** Primary category id; used for the event's visual language. */
  readonly categoryId: EventCategoryId
  /** All categories the source associated with the event. */
  readonly categoryIds: readonly EventCategoryId[]
  /** `null` while active; ISO-8601 timestamp once closed/resolved. */
  readonly closed: string | null
  readonly isActive: boolean
  readonly sources: readonly EventSource[]
  /** Time-ordered geometry (oldest first). Always at least one entry. */
  readonly geometries: readonly EventGeometry[]
  /** Convenience accessors derived from {@link geometries}. */
  readonly firstDetected: string
  readonly latestUpdate: string
  /** Most recent known position — the point shown on the globe. */
  readonly position: GeoPoint
  /** Identifier of the provider that produced this event. */
  readonly providerId: string
}

/** Duration of an event in milliseconds (closed events use their close time). */
export function eventDurationMs(event: NaturalEvent, now: number = Date.now()): number {
  const start = new Date(event.firstDetected).getTime()
  const end = event.closed ? new Date(event.closed).getTime() : now
  return Math.max(0, end - start)
}
