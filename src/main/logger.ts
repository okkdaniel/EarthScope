/**
 * Minimal structured logger for the main process.
 *
 * Keeps output useful and low-noise (CLAUDE.md: "No excessive console output").
 * In production only warnings and errors are emitted; debug/info are gated
 * behind the EARTHSCOPE_DEBUG environment flag.
 */

// Dev is detected from env only, avoiding an `electron` import so this module
// stays safe to load in plain-Node contexts (tests) and the ESM main bundle.
// electron-vite sets ELECTRON_RENDERER_URL during development.
const isDev = Boolean(process.env.ELECTRON_RENDERER_URL) || process.env.NODE_ENV === 'development'
const debugEnabled = isDev || process.env.EARTHSCOPE_DEBUG === '1'

function line(level: string, scope: string, message: string): string {
  return `${new Date().toISOString()} ${level} [${scope}] ${message}`
}

export function createLogger(scope: string) {
  return {
    debug(message: string, ...args: unknown[]): void {
      if (debugEnabled) console.debug(line('DBG', scope, message), ...args)
    },
    info(message: string, ...args: unknown[]): void {
      if (debugEnabled) console.info(line('INF', scope, message), ...args)
    },
    warn(message: string, ...args: unknown[]): void {
      console.warn(line('WRN', scope, message), ...args)
    },
    error(message: string, error?: unknown): void {
      console.error(line('ERR', scope, message), error ?? '')
    }
  }
}
