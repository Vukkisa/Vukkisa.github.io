import type { ReactNode } from 'react'
import { RagFlow } from '../components/RagFlow'
import { SectionHead } from '../components/SectionHead'
import { TokenPlayground } from '../components/TokenPlayground'
import { ZoneTest } from '../components/ZoneTest'
import { cn } from '../lib/utils'

export const LAB = [
  { id: 'lab-rag', n: '01', title: 'RAG, step by step', tag: 'from KnowYourRules', body: <RagFlow />, wide: true },
  { id: 'lab-zone', n: '02', title: 'Zone check', tag: 'from AI Surveillance', body: <ZoneTest /> },
  { id: 'lab-tokens', n: '03', title: 'Design tokens', tag: 'this site', body: <TokenPlayground /> },
] as const

function Experiment({ id, n, title, tag, wide, children }: { id: string; n: string; title: string; tag: string; wide?: boolean; children: ReactNode }) {
  return (
    <article id={id} aria-labelledby={`${id}-title`} data-reveal className={cn('pad rounded-(--r) border border-line bg-card', wide && 'lg:col-span-2')}>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${id}-title`} className="font-display text-2xl font-semibold tracking-tight">
          <span aria-hidden="true" className="mr-2 font-mono text-xs font-normal tracking-normal text-mute">exp. {n}</span>
          {title}
        </h3>
        <span className="font-mono text-[11px] text-mute">⌘ {tag}</span>
      </header>
      {children}
    </article>
  )
}

export function Lab() {
  return (
    <section id="lab" aria-labelledby="lab-title" className="sec">
      <SectionHead id="lab-title" n="03" glyph="⌘" title="Lab" count={LAB.length} note="Small, honest experiments. Each one runs entirely in your browser." />
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {LAB.map(x => (
          <Experiment key={x.id} id={x.id} n={x.n} title={x.title} tag={x.tag} wide={'wide' in x && x.wide}>{x.body}</Experiment>
        ))}
      </div>
    </section>
  )
}
