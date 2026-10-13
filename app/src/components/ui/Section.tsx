import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Reveal } from './Reveal'

type Props = { id: string; index: string; kicker: string; title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }

/** A numbered chapter: index and kicker on a rule, a serif title, an optional intro, then the content. */
export function Section({ id, index, kicker, title, intro, children, className }: Props) {
  const headingId = `${id}-title`
  return (
    <section id={id} aria-labelledby={headingId} className={cn('px-5 py-20 sm:px-8 sm:py-28', className)}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label flex items-center gap-4">
            <span className="text-accent">{index}</span>
            <span>{kicker}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-rule" />
          </p>
          <h2 id={headingId} className="display mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)]">{title}</h2>
          {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{intro}</div>}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  )
}
