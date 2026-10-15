import { useId, useState } from 'react'
import { cn } from '../lib/utils'

/**
 * How a question moves through KnowYourRules, for a state the visitor picks.
 * Every step mirrors backend/server.py in the team repository: Central rules are always retrieved
 * (k=4), a state's own documents are added (k=4) only if that state is indexed, and for an
 * unindexed state the model is told to say so. It's a diagram of that logic, not a live model.
 */
const STATES = [
  { name: 'Gujarat', indexed: true },
  { name: 'Delhi', indexed: true },
  { name: 'Haryana', indexed: false },
] as const
type State = (typeof STATES)[number]

function steps(s: State) {
  return [
    { label: 'Location', mine: false, text: `Asks which state you’re in, because traffic rules differ by state. Here: ${s.name}.` },
    { label: 'Rewrite', mine: false, text: 'Turns a follow-up like “what about bikes?” into a standalone question, using the recent conversation.' },
    {
      label: 'Retrieve', mine: true,
      text: s.indexed
        ? `Searches the Chroma vector store: 4 chunks from the nationwide central rules, plus 4 from ${s.name}’s own rules.`
        : `Searches the Chroma vector store: 4 chunks from the nationwide central rules only. ${s.name}’s documents aren’t indexed yet.`,
    },
    {
      label: 'Ground', mine: true,
      text: s.indexed
        ? 'Only the retrieved chunks go to the model, each tagged with its source document and state.'
        : `Only the retrieved chunks go to the model, with an instruction to say that ${s.name}’s rules aren’t covered.`,
    },
    {
      label: 'Answer', mine: true,
      text: s.indexed
        ? 'Groq writes the answer from those chunks and names the source documents.'
        : `Groq answers from the central rules only, and says plainly that ${s.name}-specific rules aren’t in the knowledge base yet.`,
    },
  ]
}

export function RagFlow() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>(STATES[0])
  const id = useId()
  const panelId = `${id}-panel`

  return (
    <div className="mt-5 border-t border-line pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        className="group inline-flex items-center gap-2 text-sm font-medium text-fg"
      >
        <span className="underline decoration-line-strong underline-offset-4 group-hover:decoration-fg">How a question flows through it</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className={cn('size-3.5 text-mute motion-safe:transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      <div id={panelId} hidden={!open} className="mt-4">
        <p className="text-xs leading-relaxed text-mute">
          A diagram of the pipeline’s logic, taken from the repository’s code. It isn’t a live model: nothing is sent or answered here.
        </p>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium uppercase tracking-wide text-mute">Asking from</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATES.map(s => (
              <label
                key={s.name}
                className={cn(
                  'cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fg',
                  state.name === s.name ? 'border-fg bg-fg text-bg' : 'border-line-strong text-soft hover:border-fg hover:text-fg',
                )}
              >
                <input type="radio" name={`${id}-state`} value={s.name} checked={state.name === s.name} onChange={() => setState(s)} className="sr-only" />
                {s.name}
                <span className="sr-only">{s.indexed ? ' (indexed)' : ' (not indexed yet)'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <ol className="mt-5 space-y-2.5">
          {steps(state).map((st, i) => (
            <li key={st.label} className={cn('grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 border-l-2 pl-3 text-sm leading-relaxed sm:grid-cols-[1.25rem_4.5rem_minmax(0,1fr)]', st.mine ? 'border-accent' : 'border-line')}>
              <span className="font-mono text-xs leading-6 text-mute">{i + 1}</span>
              <span className={cn('font-medium', st.mine ? 'text-accent' : 'text-fg')}>{st.label}</span>
              <span className="col-start-2 text-soft sm:col-start-auto">{st.text}</span>
            </li>
          ))}
        </ol>

        <figure className="mt-5">
          <div className="flex flex-wrap gap-1.5" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => {
              const central = i < 4
              const filled = central || state.indexed
              return (
                <span
                  key={i}
                  className={cn(
                    'grid h-8 w-14 place-items-center rounded-md border font-mono text-[10px] motion-safe:transition-colors motion-safe:duration-300',
                    central && 'border-line-strong bg-chip text-soft',
                    !central && filled && 'border-accent bg-accent-soft text-accent',
                    !filled && 'border-dashed border-line-strong text-mute',
                  )}
                >
                  {central ? 'Central' : filled ? state.name : 'none'}
                </span>
              )
            })}
          </div>
          <figcaption className="mt-2 text-xs text-mute" aria-live="polite">
            {state.indexed
              ? `Up to 8 chunks reach the model: 4 central, 4 from ${state.name}.`
              : `Only the 4 central chunks reach the model; ${state.name} has none indexed.`}
          </figcaption>
        </figure>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mute">
          <span aria-hidden="true" className="mt-1 inline-block h-2.5 w-0.5 shrink-0 bg-accent" />
          Highlighted: the retrieval and grounded-answer steps, my part. Location handling, question rewriting and the coverage instruction are the team’s backend.
        </p>
      </div>
    </div>
  )
}
