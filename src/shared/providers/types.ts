import type { NaturalEvent } from '../models/event'
import type { EventCategoryId } from '../models/category'
import type { Result } from '../utils/result'

/**
 * The provider contract.
 *
 * A `DataProvider` turns some external feed into EarthScope's canonical
 * {@link NaturalEvent} model. NASA EONET is the first implementation, but the
 * app depends only on this interface so additional feeds (wildfire hotspots,
 * earthquakes, weather layers) can be added without touching UI or state code.
 */

export interface EventQuery {
  /** Restrict to these categories (provider maps onto its own taxonomy). */
  readonly categories?: readonly EventCategoryId[]
  /** Include closed events from the last N days (provider-dependent). */
  readonly days?: number
  /** `open` = active only, `closed` = resolved only, `all` = both. */
  readonly status?: 'open' | 'closed' | 'all'
  /** Soft cap on returned events. */
  readonly limit?: number
  /** Abort signal for cancellation / timeouts. */
  readonly signal?: AbortSignal
}

export interface ProviderInfo {
  readonly id: string
  readonly name: string
  readonly attribution: string
  readonly homepage: string
}

export interface DataProvider {
  readonly info: ProviderInfo
  /** Whether the provider is currently enabled by the user. */
  isEnabled(): boolean
  /** Fetch and normalise events matching the query. */
  fetchEvents(query: EventQuery): Promise<Result<NaturalEvent[]>>
}
