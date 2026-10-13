export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scroll to an element by id, honouring reduced motion. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
