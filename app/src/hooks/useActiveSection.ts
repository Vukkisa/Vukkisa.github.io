import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Which of the given sections is "current": the first one (in page order) crossing a band in the
 * upper part of the viewport, or the last section once the page is scrolled to the bottom.
 *
 * `pin(id)` is for nav clicks: on a short page several links can land on the same scroll position
 * (the bottom), so the clicked section is shown until the visitor scrolls again themselves.
 * Without IntersectionObserver it simply returns '' and nothing is highlighted.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState('')
  const pinned = useRef<string | null>(null)

  const pin = useCallback((id: string) => { pinned.current = id; setActive(id) }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const visible = new Map<string, boolean>()
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    const update = () => {
      if (pinned.current) return
      setActive(atBottom() ? ids[ids.length - 1] : (ids.find(id => visible.get(id)) ?? ''))
    }
    const unpin = () => { pinned.current = null }
    const onKey = (e: KeyboardEvent) => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) unpin() }

    const io = new IntersectionObserver(
      entries => { entries.forEach(e => visible.set(e.target.id, e.isIntersecting)); update() },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    window.addEventListener('scroll', update, { passive: true })
    // Only the visitor's own scrolling releases a pin, not the smooth scroll a nav click starts.
    window.addEventListener('wheel', unpin, { passive: true })
    window.addEventListener('touchstart', unpin, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('wheel', unpin)
      window.removeEventListener('touchstart', unpin)
      window.removeEventListener('keydown', onKey)
    }
  }, [ids])

  return { active, pin }
}
