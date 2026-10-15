import { useEffect } from 'react'

/**
 * Fades [data-reveal] elements in as they enter the viewport. Anything already on screen is marked
 * visible *before* the hiding styles switch on, so nothing flashes. With reduced motion (or no
 * IntersectionObserver) this does nothing and the page renders as plain, fully visible content.
 */
export function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in') })
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    els.filter(el => !el.classList.contains('is-in')).forEach(el => io.observe(el))
    document.documentElement.classList.add('reveal-on')
    return () => { io.disconnect(); document.documentElement.classList.remove('reveal-on') }
  }, [])
}
