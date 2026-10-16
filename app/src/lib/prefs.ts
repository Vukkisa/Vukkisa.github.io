import { useSyncExternalStore } from 'react'

/**
 * Visitor preferences: theme, text size and the live design tokens from the Lab. Each one is a
 * data-* attribute on <html> that index.css reads, so a change restyles the whole page at once.
 * Saved to localStorage; the inline script in index.html applies them before first paint.
 */
export const OPTIONS = {
  theme: ['dark', 'light'],
  text: ['md', 'lg'],
  accent: ['cobalt', 'ember', 'moss', 'rose', 'mono'],
  type: ['grotesk', 'sans', 'mono'],
  density: ['compact', 'cozy', 'airy'],
  radius: ['none', 'soft', 'round'],
} as const

type Options = typeof OPTIONS
export type Prefs = { [K in keyof Options]: Options[K][number] }
export type TokenKey = 'accent' | 'type' | 'density' | 'radius'

export const DEFAULTS: Prefs = { theme: 'dark', text: 'md', accent: 'cobalt', type: 'grotesk', density: 'cozy', radius: 'soft' }
const KEY = 'prefs'

function read(): Prefs {
  const p = { ...DEFAULTS }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>
    saved.theme ??= localStorage.getItem('theme')   // the previous version of the site stored only this
    for (const k of Object.keys(OPTIONS) as (keyof Prefs)[]) {
      if ((OPTIONS[k] as readonly unknown[]).includes(saved[k])) (p as Record<string, unknown>)[k] = saved[k]
    }
  } catch { /* storage blocked or corrupt: use the defaults */ }
  return p
}

let prefs = read()
const listeners = new Set<() => void>()

function apply(p: Prefs) {
  const d = document.documentElement.dataset
  for (const [k, v] of Object.entries(p)) d[k] = v
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (prefs[key] === value) return
  const root = document.documentElement
  // A short colour cross-fade while colours change (see .theme-fade in index.css).
  if (key === 'theme' || key === 'accent') {
    root.classList.add('theme-fade')
    window.setTimeout(() => root.classList.remove('theme-fade'), 200)
  }
  prefs = { ...prefs, [key]: value }
  apply(prefs)
  try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* private mode: just won't persist */ }
  listeners.forEach(l => l())
}

export function resetTokens() {
  for (const k of ['accent', 'type', 'density', 'radius'] as const) setPref(k, DEFAULTS[k])
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export const usePrefs = () => useSyncExternalStore(subscribe, () => prefs, () => prefs)

export const toggleTheme = () => setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark')
export const toggleText = () => setPref('text', prefs.text === 'lg' ? 'md' : 'lg')
