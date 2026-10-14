import type { CSSProperties, ReactNode } from 'react'

/** A quiet section: a small label, then the content. */
export function Section({ id, title, children, i = 0, first = false }: { id: string; title: string; children: ReactNode; i?: number; first?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`rise scroll-mt-8 ${first ? 'mt-12 sm:mt-14' : 'mt-16 sm:mt-20'}`} style={{ '--i': i } as CSSProperties}>
      <h2 id={`${id}-title`} className="text-sm font-medium text-mute">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}
