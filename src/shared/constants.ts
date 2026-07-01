/** App-wide constants shared across processes. */

export const APP_NAME = 'EarthScope'

/** How long a live event fetch remains "fresh" before a background refetch. */
export const EVENTS_STALE_TIME_MS = 5 * 60_000

/** Default query window (days) used when requesting recent history. */
export const DEFAULT_HISTORY_DAYS = 60

/** Upper bound on events requested in a single fetch. */
export const MAX_EVENTS = 500
