import type { GeoPoint, LngLat } from '../models/geo'

const EARTH_RADIUS_KM = 6371.0088
const DEG2RAD = Math.PI / 180

/** Great-circle distance between two points in kilometres (haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.latitude - a.latitude) * DEG2RAD
  const dLon = (b.longitude - a.longitude) * DEG2RAD
  const lat1 = a.latitude * DEG2RAD
  const lat2 = b.latitude * DEG2RAD

  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Centroid of a ring of `[lng, lat]` coordinates (simple average). */
export function centroidOf(coords: readonly LngLat[]): GeoPoint {
  if (coords.length === 0) return { latitude: 0, longitude: 0 }
  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of coords) {
    sumLng += lng
    sumLat += lat
  }
  return { latitude: sumLat / coords.length, longitude: sumLng / coords.length }
}

/**
 * Convert geographic coordinates to a unit-sphere 3D position.
 *
 * Uses the standard equirectangular-to-sphere mapping with longitude offset so
 * that texture-mapped globes align with coordinates. Returns `[x, y, z]` for a
 * sphere of the given radius.
 */
export function latLngToVector3(
  latitude: number,
  longitude: number,
  radius = 1
): [number, number, number] {
  const phi = (90 - latitude) * DEG2RAD
  const theta = (longitude + 180) * DEG2RAD
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return [x, y, z]
}

/**
 * Coarse continent classification from a point, used for analytics grouping.
 * This is an intentionally approximate bounding-box test — accurate enough for
 * high-level "events by continent" charts without shipping a polygon dataset.
 */
export function continentOf({ latitude: lat, longitude: lng }: GeoPoint): string {
  if (lat > 15 && lng > -170 && lng < -50) return 'North America'
  if (lat <= 15 && lat > -60 && lng > -90 && lng < -30) return 'South America'
  if (lat > 35 && lng > -25 && lng < 45) return 'Europe'
  if (lat <= 37 && lat > -38 && lng > -20 && lng < 52) return 'Africa'
  if (lat > -10 && lng >= 45 && lng < 180) return 'Asia'
  if (lat <= -10 && lng > 110 && lng < 180) return 'Oceania'
  if (lat < -60) return 'Antarctica'
  return 'Other'
}

/** Format a coordinate pair for display, e.g. `34.05°N, 118.24°W`. */
export function formatCoordinates({ latitude, longitude }: GeoPoint): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? 'N' : 'S'}`
  const lng = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? 'E' : 'W'}`
  return `${lat}, ${lng}`
}
