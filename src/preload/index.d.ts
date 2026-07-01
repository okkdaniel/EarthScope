import type { EarthScopeBridge } from '@shared/ipc'

/**
 * Ambient declaration of the preload bridge so the renderer gets full type
 * safety on `window.earthscope` without importing preload code.
 */
declare global {
  interface Window {
    earthscope: EarthScopeBridge
  }
}

export {}
