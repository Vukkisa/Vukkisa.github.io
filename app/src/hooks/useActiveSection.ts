import { useEffect, useState } from 'react'

/** The id of the section crossing the upper part of the viewport, or '' when none is. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const visible = new Map<string, boolean>()
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    // The first section (in page order) inside the band wins, so the highlight never flickers between
    // two sections that are both partly on screen. At the very bottom the last section wins, since a
    // short final section can never scroll up into the band.
    const update = () => setActive(atBottom() ? ids[ids.length - 1] : (ids.find(id => visible.get(id)) ?? ''))
    const io = new IntersectionObserver(
      entries => { entries.forEach(e => visible.set(e.target.id, e.isIntersecting)); update() },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    window.addEventListener('scroll', update, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', update) }
  }, [ids])
  return active
}
