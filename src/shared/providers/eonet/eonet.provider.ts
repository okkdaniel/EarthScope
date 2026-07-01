import type { NaturalEvent } from '../../models/event'
import { err, ok, type Result } from '../../utils/result'
import { fetchJson } from '../http'
import type { DataProvider, EventQuery, ProviderInfo } from '../types'
import { EONET_PROVIDER_ID, mapEonetEvent } from './eonet.mapper'
import type { EonetEventsResponse } from './eonet.types'

const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3'

export interface EonetProviderOptions {
  /** Override the base URL (used in tests / for mirrors). */
  readonly baseUrl?: string
  /** Enabled state accessor (wired to user settings). */
  readonly enabled?: () => boolean
}

/**
 * NASA EONET data provider — the reference implementation of {@link DataProvider}.
 *
 * Responsible only for talking to EONET and normalising the result; it holds no
 * UI state and performs no caching (caching is the query layer's concern). This
 * keeps the provider a pure, independently testable unit.
 */
export class EonetProvider implements DataProvider {
  readonly info: ProviderInfo = {
    id: EONET_PROVIDER_ID,
    name: 'NASA EONET',
    attribution: 'NASA Earth Observatory Natural Event Tracker (EONET)',
    homepage: 'https://eonet.gsfc.nasa.gov'
  }

  private readonly baseUrl: string
  private readonly enabled: () => boolean

  constructor(options: EonetProviderOptions = {}) {
    this.baseUrl = options.baseUrl ?? EONET_BASE_URL
    this.enabled = options.enabled ?? (() => true)
  }

  isEnabled(): boolean {
    return this.enabled()
  }

  async fetchEvents(query: EventQuery): Promise<Result<NaturalEvent[]>> {
    const url = this.buildUrl(query)
    const response = await fetchJson<EonetEventsResponse>(url, { signal: query.signal })
    if (!response.ok) return response

    const rawEvents = response.value?.events
    if (!Array.isArray(rawEvents)) {
      return err({
        kind: 'parse',
        message: 'The event feed returned an unexpected format.'
      })
    }

    const events = rawEvents
      .map(mapEonetEvent)
      .filter((event): event is NaturalEvent => event !== null)

    return ok(events)
  }

  /** Construct the EONET events endpoint URL from a domain query. */
  private buildUrl(query: EventQuery): string {
    const params = new URLSearchParams()
    // EONET `status`: open | closed. "all" is expressed by requesting closed
    // events over a window plus open events — we default to open, and widen via
    // `days` when the caller wants recent history.
    if (query.status === 'closed') params.set('status', 'closed')
    else if (query.status === 'all') params.set('status', 'all')
    else params.set('status', 'open')

    if (query.days && query.days > 0) params.set('days', String(query.days))
    if (query.limit && query.limit > 0) params.set('limit', String(query.limit))
    if (query.categories && query.categories.length > 0) {
      params.set('category', query.categories.join(','))
    }

    return `${this.baseUrl}/events?${params.toString()}`
  }
}
