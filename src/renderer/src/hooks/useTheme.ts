import { useEffect } from 'react'

/**
 * EarthScope uses a single warm editorial palette (the design system defines
 * no dark mode). This hook simply pins the document to the light colour-scheme
 * so native form controls render on-brand. Kept as a hook for API stability.
 */
export function useTheme(): void {
  useEffect(() => {
    document.documentElement.style.colorScheme = 'light'
  }, [])
}
