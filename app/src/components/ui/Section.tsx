import type { ReactNode } from 'react'

/** A quiet section: a small label, then the content. Fades in as it scrolls into view (useReveal). */
export function Section({ id, title, children, first = false }: { id: string; title: string; children: ReactNode; first?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-reveal className={`scroll-mt-8 ${first ? 'mt-12 sm:mt-14 lg:mt-0' : 'mt-16 sm:mt-20'}`}>
      <h2 id={`${id}-title`} className="text-sm font-medium text-mute">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}
