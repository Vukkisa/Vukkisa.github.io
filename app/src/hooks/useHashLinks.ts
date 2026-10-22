import { useEffect } from 'react'

/**
 * Makes links into the page work. The sections are drawn by React after the browser has already
 * tried (and failed) to jump to the URL's #hash, so on load this scrolls there itself. A target
 * that is a <details> (a case study, the design tokens) is opened first, on load and whenever the
 * hash changes later.
 */
export function useHashLinks() {
  useEffect(() => {
    const go = (onLoad: boolean) => {
      const id = decodeURIComponent(location.hash.slice(1))
      const el = id && document.getElementById(id)
      if (!el) return
      const details = el instanceof HTMLDetailsElement
      if (details) el.open = true
      // On load, jump straight there rather than gliding down the whole page.
      if (onLoad || details) el.scrollIntoView({ block: 'start', behavior: onLoad ? 'instant' : 'auto' })
    }
    go(true)
    const onHash = () => go(false)   // plain targets: the browser scrolls to them itself
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
}
