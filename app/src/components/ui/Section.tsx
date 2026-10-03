import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Reveal } from './Reveal'

type Props = { id: string; path: string; title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }

/** Every chapter of the site: a file path, a big title, an optional intro, then the content. */
export function Section({ id, path, title, intro, children, className }: Props) {
  const headingId = `${id}-title`
  return (
    <section id={id} aria-labelledby={headingId} className={cn('relative px-5 py-28 sm:px-8 sm:py-36 lg:pl-32 lg:pr-12', className)}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="label flex items-center gap-4">
            <span className="text-amber">{path}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-rule" />
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id={headingId} className="display mt-8 max-w-4xl text-[clamp(2.6rem,7vw,6rem)]">{title}</h2>
        </Reveal>
        {intro && (
          <Reveal delay={0.1}>
            <div className="mt-6 max-w-2xl text-lg leading-relaxed text-soft">{intro}</div>
          </Reveal>
        )}
        <div className="mt-14 sm:mt-20">{children}</div>
      </div>
    </section>
  )
}
