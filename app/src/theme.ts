import { applyMode, Mode } from '@cloudscape-design/global-styles'

const STORAGE_KEY = 'cfnlab-theme'

export function getStoredMode(): Mode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark') return Mode.Dark
    if (stored === 'light') return Mode.Light
  } catch {
    /* ignore */
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? Mode.Dark : Mode.Light
}

export function setStoredMode(mode: Mode) {
  applyMode(mode)
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export function initTheme(): Mode {
  const mode = getStoredMode()
  applyMode(mode)
  return mode
}
