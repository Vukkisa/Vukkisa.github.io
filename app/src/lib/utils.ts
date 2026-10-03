export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scroll to an element by id, honouring reduced motion. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

/** Roving keyboard focus for tab lists: arrows, Home and End. Returns the index to select, or null. */
export function rovingIndex(key: string, current: number, count: number, vertical = false): number | null {
  const prev = vertical ? 'ArrowUp' : 'ArrowLeft'
  const next = vertical ? 'ArrowDown' : 'ArrowRight'
  if (key === next) return (current + 1) % count
  if (key === prev) return (current - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}
