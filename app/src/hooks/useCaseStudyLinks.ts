import { useEffect } from 'react'

/**
 * A link to #<project-id>-case opens that case study (a <details>) and scrolls to it, both when the
 * page loads with that hash and when the hash changes later.
 */
export function useCaseStudyLinks() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1))
      if (!id.endsWith('-case')) return
      const el = document.getElementById(id)
      if (!(el instanceof HTMLDetailsElement)) return
      el.open = true
      el.scrollIntoView({ block: 'start' })
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
}
