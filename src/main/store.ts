import { app } from 'electron'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { NaturalEvent } from '@shared/models/event'
import { normalizeSettings, type AppSettings } from '@shared/models/settings'

/**
 * Lightweight JSON persistence for settings and the offline event cache.
 *
 * Deliberately avoids a native dependency: two small JSON files under the OS
 * userData directory are enough, atomic-enough (write-then-rename), and easy to
 * reason about. All writes are debounced by the caller where needed.
 */

interface CacheFile {
  fetchedAt: string
  events: NaturalEvent[]
}

function userDataFile(name: string): string {
  return join(app.getPath('userData'), name)
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    if (!existsSync(path)) return null
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    // A corrupt file should degrade gracefully, not crash startup.
    return null
  }
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  await writeFile(tmp, JSON.stringify(value, null, 2), 'utf-8')
  // Rename is atomic on the same filesystem, preventing partial reads.
  const { rename } = await import('node:fs/promises')
  await rename(tmp, path)
}

export class SettingsStore {
  private readonly path = userDataFile('settings.json')
  private cached: AppSettings | null = null

  async get(): Promise<AppSettings> {
    if (this.cached) return this.cached
    const persisted = await readJson<Partial<AppSettings>>(this.path)
    this.cached = normalizeSettings(persisted)
    return this.cached
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get()
    const next = normalizeSettings({ ...current, ...patch })
    this.cached = next
    await writeJsonAtomic(this.path, next)
    return next
  }
}

export class EventCacheStore {
  private readonly path = userDataFile('events-cache.json')

  async read(): Promise<CacheFile | null> {
    return readJson<CacheFile>(this.path)
  }

  async write(events: NaturalEvent[]): Promise<void> {
    const payload: CacheFile = { fetchedAt: new Date().toISOString(), events }
    await writeJsonAtomic(this.path, payload)
  }
}
