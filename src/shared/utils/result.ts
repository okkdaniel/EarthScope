/**
 * A tiny, dependency-free `Result` type for modelling fallible operations
 * without throwing across module boundaries. The data layer returns these so
 * callers must consciously handle failure (see CLAUDE.md: "Errors should be
 * helpful ... provide meaningful recovery paths").
 */

export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

/** Categorised, user-facing error surfaced by the data layer. */
export type AppErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'offline' | 'unknown'

export interface AppError {
  readonly kind: AppErrorKind
  /** Human-readable, non-technical message safe to show a user. */
  readonly message: string
  /** Optional HTTP status for `http` errors. */
  readonly status?: number
  /** Original error for logging only — never rendered to the user. */
  readonly cause?: unknown
}

export function appError(
  kind: AppErrorKind,
  message: string,
  extra?: { status?: number; cause?: unknown }
): AppError {
  return { kind, message, ...extra }
}

/** Map a low-level error into a friendly {@link AppError}. */
export function toAppError(error: unknown): AppError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return appError('timeout', 'The request took too long and was cancelled.', { cause: error })
  }
  if (error instanceof TypeError) {
    // fetch() throws TypeError for network failures.
    return appError('network', 'Could not reach the server. Check your connection.', {
      cause: error
    })
  }
  if (error instanceof Error) {
    return appError('unknown', error.message, { cause: error })
  }
  return appError('unknown', 'An unexpected error occurred.', { cause: error })
}
