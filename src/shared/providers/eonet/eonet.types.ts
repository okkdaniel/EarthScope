/**
 * Raw NASA EONET v3 API response shapes.
 *
 * These types describe the wire format exactly as returned by the API and are
 * intentionally permissive (many fields are optional/nullable) so the mapper
 * can defend against malformed responses. Nothing outside the EONET provider
 * should import from this file — the rest of the app uses the domain model.
 *
 * @see https://eonet.gsfc.nasa.gov/docs/v3
 */

export interface EonetCategoryRef {
  id: string
  title?: string
}

export interface EonetSource {
  id: string
  url: string
}

export interface EonetGeometry {
  magnitudeValue?: number | null
  magnitudeUnit?: string | null
  date: string
  type: 'Point' | 'Polygon' | string
  /** For Point: `[lng, lat]`. For Polygon: nested coordinate rings. */
  coordinates: unknown
}

export interface EonetEvent {
  id: string
  title: string
  description?: string | null
  link?: string | null
  closed?: string | null
  categories: EonetCategoryRef[]
  sources?: EonetSource[]
  geometry?: EonetGeometry[]
  /** Some API versions use `geometries`; we accept either. */
  geometries?: EonetGeometry[]
}

export interface EonetEventsResponse {
  title?: string
  description?: string
  link?: string
  events?: EonetEvent[]
}
