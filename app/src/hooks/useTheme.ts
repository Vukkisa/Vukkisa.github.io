import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'theme'

const systemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/**
 * Light or dark. Follows the system until the visitor picks one, then remembers the choice.
 * index.html sets data-theme before first paint so there's no flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme())

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (!storedTheme()) setTheme(systemTheme()) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    // A brief colour cross-fade while the theme switches (see .theme-fade in index.css).
    root.classList.add('theme-fade')
    root.dataset.theme = next
    window.setTimeout(() => root.classList.remove('theme-fade'), 200)
    try { localStorage.setItem(KEY, next) } catch { /* private mode: the choice just won't persist */ }
    setTheme(next)
  }, [theme])

  return { theme, toggle }
}
