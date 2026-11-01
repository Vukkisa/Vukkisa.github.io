import { useCallback, useEffect, useRef, useState } from 'react'

/** Keys that scroll the page; pressing one releases a pin (see `unpin`). */
export const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']

/** Dispatched on window by goTo (CommandPalette) before it scrolls. */
export const NAVIGATE = 'site:navigate'

/**
 * Which of the given sections is "current": the first one (in page order) crossing a band in the
 * upper part of the viewport, or the last section once the page is scrolled to the bottom. Also
 * reports whether the page has scrolled at all, so the top bar can share this one scroll listener.
 *
 * `pin(id)` is for nav clicks: on a short page several links can land on the same scroll position
 * (the bottom), so the clicked section is shown until the visitor scrolls again themselves. The
 * visitor's own wheel or touch scrolling releases it here; scroll keys release it through `unpin`,
 * which the caller wires into its keydown handler (one keydown listener for the whole top bar).
 * Any other jump within the page (an in-page link outside the nav, or the command menu's goTo,
 * which dispatches NAVIGATE) releases it too, so the highlight follows where the visitor went.
 * Without IntersectionObserver the active section stays '' and nothing is highlighted.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const pinned = useRef<string | null>(null)

  const pin = useCallback((id: string) => { pinned.current = id; setActive(id) }, [])
  const unpin = useCallback(() => { pinned.current = null }, [])

  useEffect(() => {
    const visible = new Map<string, boolean>()
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    const update = () => {
      setScrolled(window.scrollY > 8)
      if (pinned.current || !('IntersectionObserver' in window)) return
      setActive(atBottom() ? ids[ids.length - 1] : (ids.find(id => visible.get(id)) ?? ''))
    }

    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          entries => { entries.forEach(e => visible.set(e.target.id, e.isIntersecting)); update() },
          { rootMargin: '-30% 0px -60% 0px' },
        )
      : null
    ids.forEach(id => { const el = document.getElementById(id); if (el) io?.observe(el) })
    update()
    window.addEventListener('scroll', update, { passive: true })
    // Only the visitor's own scrolling releases a pin, not the smooth scroll a nav click starts.
    window.addEventListener('wheel', unpin, { passive: true })
    window.addEventListener('touchstart', unpin, { passive: true })
    window.addEventListener(NAVIGATE, unpin)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (a && !a.closest('header nav')) unpin()
    }
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener(NAVIGATE, unpin)
      document.removeEventListener('click', onClick)
      io?.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('wheel', unpin)
      window.removeEventListener('touchstart', unpin)
    }
  }, [ids, unpin])

  return { active, pin, unpin, scrolled }
}
