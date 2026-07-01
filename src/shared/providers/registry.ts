import { dedupeEvents } from '../services/aggregate'
import type { NaturalEvent } from '../models/event'
import { ok, type Result } from '../utils/result'
import { EonetProvider } from './eonet/eonet.provider'
import type { DataProvider, EventQuery } from './types'

/**
 * A registry that aggregates events from every enabled {@link DataProvider}.
 *
 * This is the single seam the rest of the app talks to. Adding a new feed is as
 * simple as `registry.register(new MyProvider())` — no UI or state changes.
 * Failures from one provider never sink the others: we return whatever
 * succeeded and attach the last error only if *everything* failed.
 */
export class ProviderRegistry {
  private readonly providers = new Map<string, DataProvider>()

  register(provider: DataProvider): this {
    this.providers.set(provider.info.id, provider)
    return this
  }

  get(id: string): DataProvider | undefined {
    return this.providers.get(id)
  }

  list(): DataProvider[] {
    return [...this.providers.values()]
  }

  /** Fetch from all enabled providers in parallel and merge the results. */
  async fetchAll(query: EventQuery): Promise<Result<NaturalEvent[]>> {
    const active = this.list().filter((p) => p.isEnabled())
    if (active.length === 0) return ok([])

    const settled = await Promise.all(active.map((p) => p.fetchEvents(query)))

    const merged: NaturalEvent[] = []
    const lastError = settled.find((r) => !r.ok)
    let anySuccess = false

    for (const result of settled) {
      if (result.ok) {
        anySuccess = true
        merged.push(...result.value)
      }
    }

    if (!anySuccess && lastError && !lastError.ok) return lastError
    return ok(dedupeEvents(merged))
  }
}

/** Build the default registry with the providers shipped in-box. */
export function createDefaultRegistry(
  options: { eonetEnabled?: () => boolean } = {}
): ProviderRegistry {
  return new ProviderRegistry().register(
    new EonetProvider({ enabled: options.eonetEnabled })
  )
}
