/**
 * Geospatial primitives shared across the whole application.
 *
 * We standardise on `[longitude, latitude]` ordering (GeoJSON convention)
 * for raw coordinate tuples, but expose a named {@link GeoPoint} for places
 * where readability matters more than interop.
 */

/** A `[longitude, latitude]` tuple following the GeoJSON convention. */
export type LngLat = readonly [longitude: number, latitude: number]

/** A named geographic point in decimal degrees. */
export interface GeoPoint {
  readonly latitude: number
  readonly longitude: number
}

/** An axis-aligned geographic bounding box in decimal degrees. */
export interface GeoBounds {
  readonly west: number
  readonly south: number
  readonly east: number
  readonly north: number
}

/** Convert a GeoJSON `[lng, lat]` tuple into a named {@link GeoPoint}. */
export function toGeoPoint([longitude, latitude]: LngLat): GeoPoint {
  return { latitude, longitude }
}

/** Type guard for a well-formed `[lng, lat]` tuple with finite values. */
export function isLngLat(value: unknown): value is LngLat {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}
