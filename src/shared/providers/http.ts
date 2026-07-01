import { appError, err, ok, toAppError, type Result } from '../utils/result'

export interface FetchJsonOptions {
  readonly signal?: AbortSignal
  /** Per-request timeout in milliseconds (default 15s). */
  readonly timeoutMs?: number
  /** Number of retry attempts on transient failures (default 2). */
  readonly retries?: number
}

const DEFAULT_TIMEOUT = 15_000
const DEFAULT_RETRIES = 2

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch and parse JSON with timeout, bounded exponential-backoff retries, and
 * friendly error mapping. Retries only on network/timeout and 5xx responses —
 * never on 4xx, which indicate a client mistake that retrying cannot fix.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<Result<T>> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = options
  let lastError = appError('unknown', 'Request failed.')

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const onAbort = () => controller.abort()
    signal?.addEventListener('abort', onAbort, { once: true })
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        const isTransient = response.status >= 500
        lastError = appError('http', httpMessage(response.status), { status: response.status })
        if (isTransient && attempt < retries) {
          await delay(backoff(attempt))
          continue
        }
        return err(lastError)
      }

      const data = (await response.json()) as T
      return ok(data)
    } catch (caught) {
      // A user-initiated abort should surface immediately, not be retried.
      if (signal?.aborted) return err(toAppError(caught))
      lastError = toAppError(caught)
      if (attempt < retries) {
        await delay(backoff(attempt))
        continue
      }
      return err(lastError)
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  return err(lastError)
}

function backoff(attempt: number): number {
  // 400ms, 800ms, 1600ms ... with a little jitter.
  return 400 * 2 ** attempt + Math.random() * 200
}

function httpMessage(status: number): string {
  if (status === 404) return 'The requested data could not be found.'
  if (status === 429) return 'Too many requests — please wait a moment and try again.'
  if (status >= 500) return 'The data service is temporarily unavailable.'
  return `The request failed (HTTP ${status}).`
}
