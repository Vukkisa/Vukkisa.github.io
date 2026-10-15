import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../lib/utils'

/**
 * "How the RAG pipeline works" for KnowYourRules: four connected stages, each selectable.
 * Every statement mirrors backend/server.py and the README in the team repository
 * (github.com/DAG-21/KnowYourRules). It explains the design; it is not a live model.
 */
const STAGES = [
  {
    name: 'Question',
    summary: 'A traffic-rules question, plus your state.',
    detail:
      'You ask a traffic-rules question. Rules differ by state, so the app asks where you are if it doesn’t know, and rewrites a follow-up like “what about bikes?” into a standalone question using the recent conversation.',
    owner: 'Team backend',
    mine: false,
  },
  {
    name: 'Retrieve',
    summary: 'Matching chunks from the Chroma store.',
    detail:
      'The question is embedded locally with Ollama (nomic-embed-text) and matched against the Chroma vector store: 4 chunks from the nationwide central rules, plus 4 from your state’s rules when that state is indexed. So far that’s Gujarat and Delhi.',
    owner: 'My RAG pipeline · state filter from the team backend',
    mine: true,
  },
  {
    name: 'Context',
    summary: 'Chunks tagged with source and state.',
    detail:
      'The retrieved chunks are joined into one context, each labelled with its source document and state, inside a strict prompt that allows answers only from that text. If your state isn’t indexed, the prompt says so explicitly.',
    owner: 'My RAG pipeline',
    mine: true,
  },
  {
    name: 'Answer with sources',
    summary: 'Groq answers only from that context.',
    detail:
      'Groq (gpt-oss-120b) writes the answer from the context and names the source documents, or says the knowledge base doesn’t cover the question. A cited source shows where an answer came from, not that it’s correct. Answer accuracy hasn’t been evaluated yet.',
    owner: 'My RAG pipeline',
    mine: true,
  },
] as const

export function RagFlow() {
  const [selected, setSelected] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const stage = STAGES[selected]

  // Tabs pattern: arrow keys move between stages, Home/End jump to the ends.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = STAGES.length - 1
    const next = { ArrowRight: selected + 1, ArrowDown: selected + 1, ArrowLeft: selected - 1, ArrowUp: selected - 1, Home: 0, End: last }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const i = (next + STAGES.length) % STAGES.length
    setSelected(i)
    tabs.current[i]?.focus()
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mt-5 border-t border-line pt-4">
      <h4 id={`${id}-title`} className="text-sm font-medium text-fg">How the RAG pipeline works</h4>
      <p className="mt-1 text-xs leading-relaxed text-mute">
        A conceptual diagram of the code in the team repository. Nothing runs here: no question is sent and no answer is generated.
      </p>

      <div role="tablist" aria-label="RAG pipeline stages" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-0">
        {STAGES.map((s, i) => {
          const active = i === selected
          return (
            <button
              key={s.name}
              ref={el => { tabs.current[i] = el }}
              id={`${id}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${id}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={onKeyDown}
              className={cn(
                // Connector: a short line into each stage after the first (vertical on phones, horizontal from sm up).
                'relative rounded-lg border px-3 py-2.5 text-left transition-colors sm:mx-1.5',
                i > 0 && 'before:absolute before:-top-2 before:left-5 before:h-2 before:w-px before:bg-line-strong sm:before:-left-3 sm:before:top-1/2 sm:before:h-px sm:before:w-3',
                active ? 'border-accent bg-accent-soft' : 'border-line bg-card hover:border-line-strong',
              )}
            >
              <span className={cn('block font-mono text-[11px]', active ? 'text-accent' : 'text-mute')}>
                {String(i + 1).padStart(2, '0')}{s.mine && <span className="sr-only">, part I built</span>}
              </span>
              <span className={cn('mt-0.5 block text-sm font-medium', active ? 'text-accent' : 'text-fg')}>{s.name}</span>
              <span className="mt-0.5 block text-xs leading-snug text-soft">{s.summary}</span>
            </button>
          )
        })}
      </div>

      <div
        key={selected}
        id={`${id}-panel`}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${id}-tab-${selected}`}
        className="rag-panel mt-3 rounded-lg bg-chip px-4 py-3"
      >
        <p className="text-sm leading-relaxed text-soft">{stage.detail}</p>
        <p className="mt-2 font-mono text-[11px] text-mute">
          <span className={cn('mr-1.5 inline-block size-2 rounded-full align-middle', stage.mine ? 'bg-accent' : 'border border-line-strong')} aria-hidden="true" />
          {stage.owner}
        </p>
      </div>
    </section>
  )
}
