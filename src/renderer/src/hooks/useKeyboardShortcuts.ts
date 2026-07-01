import { useEffect } from 'react'
import { useUiStore, type ViewId } from '../state/uiStore'

/**
 * Global keyboard shortcuts.
 *
 * - Cmd/Ctrl+K  toggle the command palette
 * - g then 1..5 jump to a view (Linear-style)
 * - Esc         close the command palette / clear selection
 */
const VIEW_KEYS: Record<string, ViewId> = {
  '1': 'dashboard',
  '2': 'explore',
  '3': 'timeline',
  '4': 'analytics',
  '5': 'settings'
}

export function useKeyboardShortcuts(): void {
  const { toggleCommandPalette, closeCommandPalette, setView, selectEvent } = useUiStore.getState()

  useEffect(() => {
    let awaitingViewKey = false
    let awaitTimer: ReturnType<typeof setTimeout> | null = null

    const isTextInput = (el: EventTarget | null): boolean => {
      const node = el as HTMLElement | null
      if (!node) return false
      const tag = node.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      const meta = event.metaKey || event.ctrlKey

      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggleCommandPalette()
        return
      }

      if (event.key === 'Escape') {
        closeCommandPalette()
        selectEvent(null)
        return
      }

      if (isTextInput(event.target)) return

      if (awaitingViewKey && VIEW_KEYS[event.key]) {
        event.preventDefault()
        setView(VIEW_KEYS[event.key])
        awaitingViewKey = false
        return
      }

      if (event.key.toLowerCase() === 'g' && !meta) {
        awaitingViewKey = true
        if (awaitTimer) clearTimeout(awaitTimer)
        awaitTimer = setTimeout(() => (awaitingViewKey = false), 1200)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (awaitTimer) clearTimeout(awaitTimer)
    }
  }, [toggleCommandPalette, closeCommandPalette, setView, selectEvent])
}
