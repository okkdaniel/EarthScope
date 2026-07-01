import { useEffect } from 'react'
import { useSettingsStore } from '../state/settingsStore'

/**
 * Applies the user's theme choice to the document root. Dark is the default and
 * the design target; light and system are honoured for accessibility.
 */
export function useTheme(): void {
  const theme = useSettingsStore((s) => s.settings.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = (): void => {
      const prefersDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', prefersDark)
      root.style.colorScheme = prefersDark ? 'dark' : 'light'
    }

    apply()
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
