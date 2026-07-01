/**
 * Canonical natural-event categories.
 *
 * These identifiers mirror NASA EONET's category slugs so that a provider can
 * map onto them without a lookup table, but they are deliberately declared here
 * (not in the EONET provider) because they are part of EarthScope's own domain
 * model. Future providers map their own taxonomies onto these same ids.
 */
export const EVENT_CATEGORY_IDS = [
  'wildfires',
  'volcanoes',
  'severeStorms',
  'floods',
  'seaLakeIce',
  'dustHaze',
  'earthquakes',
  'landslides',
  'snow',
  'drought',
  'tempExtremes',
  'waterColor',
  'manmade'
] as const

export type EventCategoryId = (typeof EVENT_CATEGORY_IDS)[number]

/** The visual "language" used to render an event category on the globe. */
export type EventVisual =
  | 'wildfire'
  | 'volcano'
  | 'storm'
  | 'flood'
  | 'seaice'
  | 'dust'
  | 'earthquake'
  | 'landslide'
  | 'snow'
  | 'drought'
  | 'temperature'
  | 'water'
  | 'other'

export interface CategoryMeta {
  readonly id: EventCategoryId
  readonly label: string
  /** Tailwind token key under `colors.event.*` and the raw hex value. */
  readonly color: string
  readonly visual: EventVisual
  /** Short, human description used in tooltips and empty states. */
  readonly description: string
}

/**
 * Static metadata for every supported category. Colours are the single source
 * of truth for both the globe renderer and the UI, keeping the two in sync.
 */
export const CATEGORY_META: Record<EventCategoryId, CategoryMeta> = {
  wildfires: {
    id: 'wildfires',
    label: 'Wildfires',
    color: '#d1461f',
    visual: 'wildfire',
    description: 'Active fires and burning vegetation.'
  },
  volcanoes: {
    id: 'volcanoes',
    label: 'Volcanoes',
    color: '#b3271a',
    visual: 'volcano',
    description: 'Eruptions and volcanic activity.'
  },
  severeStorms: {
    id: 'severeStorms',
    label: 'Severe Storms',
    color: '#5a45b8',
    visual: 'storm',
    description: 'Cyclones, hurricanes and severe weather systems.'
  },
  floods: {
    id: 'floods',
    label: 'Floods',
    color: '#2e6fb0',
    visual: 'flood',
    description: 'Flooding and inundation events.'
  },
  seaLakeIce: {
    id: 'seaLakeIce',
    label: 'Sea & Lake Ice',
    color: '#2a8f8f',
    visual: 'seaice',
    description: 'Sea and lake ice formation and movement.'
  },
  dustHaze: {
    id: 'dustHaze',
    label: 'Dust & Haze',
    color: '#a9772f',
    visual: 'dust',
    description: 'Dust storms and atmospheric haze.'
  },
  earthquakes: {
    id: 'earthquakes',
    label: 'Earthquakes',
    color: '#a67c1a',
    visual: 'earthquake',
    description: 'Seismic events.'
  },
  landslides: {
    id: 'landslides',
    label: 'Landslides',
    color: '#7a4a28',
    visual: 'landslide',
    description: 'Landslides and mass earth movement.'
  },
  snow: {
    id: 'snow',
    label: 'Snow',
    color: '#7d8ba0',
    visual: 'snow',
    description: 'Significant snowfall events.'
  },
  drought: {
    id: 'drought',
    label: 'Drought',
    color: '#9a6a24',
    visual: 'drought',
    description: 'Prolonged dry conditions.'
  },
  tempExtremes: {
    id: 'tempExtremes',
    label: 'Temperature Extremes',
    color: '#c85a2a',
    visual: 'temperature',
    description: 'Extreme heat or cold events.'
  },
  waterColor: {
    id: 'waterColor',
    label: 'Water Color',
    color: '#227a8a',
    visual: 'water',
    description: 'Algal blooms and water discoloration.'
  },
  manmade: {
    id: 'manmade',
    label: 'Manmade',
    color: '#6b6b68',
    visual: 'other',
    description: 'Human-caused events.'
  }
}

const CATEGORY_ID_SET = new Set<string>(EVENT_CATEGORY_IDS)

/** Narrow an arbitrary string to a known {@link EventCategoryId}. */
export function isEventCategoryId(value: string): value is EventCategoryId {
  return CATEGORY_ID_SET.has(value)
}

/**
 * Resolve category metadata for any id, falling back to a neutral "manmade"
 * bucket so an unexpected provider category never breaks rendering.
 */
export function resolveCategoryMeta(id: string): CategoryMeta {
  return isEventCategoryId(id) ? CATEGORY_META[id] : CATEGORY_META.manmade
}

/** All categories in display order, as an array. */
export const CATEGORY_LIST: readonly CategoryMeta[] = EVENT_CATEGORY_IDS.map(
  (id) => CATEGORY_META[id]
)
