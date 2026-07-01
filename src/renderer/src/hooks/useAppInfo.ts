import { useEffect, useState } from 'react'
import type { AppInfo } from '@shared/ipc'
import { client, hasBridge } from '../api/client'

/** Fetches static app/runtime info from the main process for the About view. */
export function useAppInfo(): AppInfo | null {
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    if (!hasBridge()) return
    let cancelled = false
    void client.getAppInfo().then((result) => {
      if (!cancelled) setInfo(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return info
}
