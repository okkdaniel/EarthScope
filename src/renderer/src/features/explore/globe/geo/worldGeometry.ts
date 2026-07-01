import { BufferGeometry, Float32BufferAttribute } from 'three'
import { mesh } from 'topojson-client'
import countriesTopo from 'world-atlas/countries-110m.json'
import landTopo from 'world-atlas/land-110m.json'
import { latLngToVector3 } from '@shared/utils/geo'

// Minimal structural types for the world-atlas TopoJSON. Avoids pulling in the
// full `topojson-specification` type package for two field accesses.
interface TopoObject {
  objects: Record<string, unknown>
  arcs: unknown
  transform?: unknown
}

/**
 * Converts the bundled world-atlas TopoJSON into thin vector line geometry on a
 * unit sphere. Rendering coastlines and borders as lines (not textures) gives
 * the calm, "scientific visualisation" globe called for in CLAUDE.md — deep
 * oceans with minimal, thin land detail — while working fully offline since the
 * data is bundled at build time.
 */

const GREAT_CIRCLE_SEGMENTS = 6

interface WorldLineGeometry {
  coastlines: BufferGeometry
  borders: BufferGeometry
}

let cached: WorldLineGeometry | null = null

/** Build (once) and return the coastline and border line geometries. */
export function getWorldLineGeometry(radius = 1): WorldLineGeometry {
  if (cached) return cached

  const countries = countriesTopo as unknown as TopoObject
  const land = landTopo as unknown as TopoObject

  // `mesh` returns a GeoJSON MultiLineString of shared boundaries. The topojson
  // runtime types are permissive here, so we narrow the coordinate output.
  const borderMesh = mesh(countries as never, countries.objects.countries as never)
  const coastMesh = mesh(land as never, land.objects.land as never)

  cached = {
    coastlines: buildLineGeometry(coastMesh.coordinates as Position[][], radius),
    borders: buildLineGeometry(borderMesh.coordinates as Position[][], radius)
  }
  return cached
}

type Position = [number, number]

/**
 * Turn an array of `[lng, lat]` line strings into a single LineSegments-ready
 * geometry, subdividing each edge so long segments follow the sphere's
 * curvature instead of cutting through it.
 */
function buildLineGeometry(lines: Position[][], radius: number): BufferGeometry {
  const positions: number[] = []

  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lngA, latA] = line[i]
      const [lngB, latB] = line[i + 1]

      let prev = latLngToVector3(latA, lngA, radius)
      for (let s = 1; s <= GREAT_CIRCLE_SEGMENTS; s++) {
        const t = s / GREAT_CIRCLE_SEGMENTS
        const lat = latA + (latB - latA) * t
        const lng = lngA + (lngB - lngA) * t
        const next = latLngToVector3(lat, lng, radius)
        positions.push(prev[0], prev[1], prev[2], next[0], next[1], next[2])
        prev = next
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}
