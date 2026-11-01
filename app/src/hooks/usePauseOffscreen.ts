import { useEffect } from 'react'

/**
 * Pauses looping animations that nobody can see. Each [data-loop] element gets data-offscreen while
 * it's outside the viewport, and index.css pauses every animation inside it (pseudo-elements too).
 * With reduced motion the loops never start (they're defined only for no-preference), so this
 * only matters for everyone else. Without IntersectionObserver nothing is paused.
 */
export function usePauseOffscreen() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.toggleAttribute('data-offscreen', !e.isIntersecting))
    })
    document.querySelectorAll('[data-loop]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
