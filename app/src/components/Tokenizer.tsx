import { useId, useMemo, useState } from 'react'
import { ENCODINGS, loadEncoder, pieces, TOKEN_EXAMPLES as EXAMPLES, type EncodingName, type Encoder } from '../lib/tokenize'
import { cn } from '../lib/utils'
import { ChipChoice, Empty, Note } from './lab/LabUI'

/**
 * Token playground: real tokenization with two of OpenAI's published vocabularies, side by side.
 * The vocabularies download only when asked (about 1.5 MB, once). Until then the experiment shows
 * characters and words only, labelled as not tokens.
 */
const NAMES = Object.keys(ENCODINGS) as EncodingName[]
const MAX = 1000
type Status = 'idle' | 'loading' | 'ready' | 'error'

/** Make spaces, tabs and line breaks visible inside a token. */
const show = (t: string) => t.replace(/ /g, '·').replace(/\t/g, '→').replace(/\n/g, '↵')

export function Tokenizer() {
  const [text, setText] = useState(EXAMPLES[0].text)
  const [status, setStatus] = useState<Status>('idle')
  const [encoders, setEncoders] = useState<Partial<Record<EncodingName, Encoder>>>({})
  const [view, setView] = useState<EncodingName>('o200k_base')
  const [ids, setIds] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const id = useId()

  const load = async () => {
    setStatus('loading')
    setAttempts(a => a + 1)
    try {
      const loaded = await Promise.all(NAMES.map(n => loadEncoder(n)))
      setEncoders(Object.fromEntries(NAMES.map((n, i) => [n, loaded[i]])))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  const chars = [...text].length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const counts = useMemo(() => Object.fromEntries(NAMES.map(n => [n, encoders[n]?.encode(text).length])) as Record<EncodingName, number | undefined>, [encoders, text])
  const shown = useMemo(() => (encoders[view] && text ? pieces(encoders[view]!, text) : []), [encoders, view, text])
  const partials = shown.filter(p => p.partial).length

  const reset = () => { setText(EXAMPLES[0].text); setView('o200k_base'); setIds(false) }

  return (
    <div className="space-y-4">
      <Note label="Real tokenizers" tone="accent">
        Two of OpenAI’s published vocabularies, run in your browser with the open-source gpt-tokenizer library. Other model families (Llama, Gemma, Indic models) use their own tokenizers and would count differently.
      </Note>

      {/* input */}
      <div className="space-y-2">
        <label htmlFor={`${id}-text`} className="lab-label">Text</label>
        <textarea
          id={`${id}-text`}
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          rows={3}
          maxLength={MAX}
          className="lab-field resize-y leading-relaxed"
          aria-describedby={`${id}-stats`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Examples">
            {EXAMPLES.map(e => (
              <button key={e.label} type="button" onClick={() => setText(e.text)} aria-pressed={text === e.text} className={cn('chip border px-2 py-1 text-xs transition-colors', text === e.text ? 'border-fg bg-fg text-bg' : 'border-line text-soft hover:border-line-strong hover:text-fg')}>{e.label}</button>
            ))}
          </div>
          <p id={`${id}-stats`} className="font-mono text-[0.6875rem] text-mute">{chars} characters · {words} words <span className="text-soft">(not tokens)</span> · max {MAX}</p>
        </div>
      </div>

      {/* output */}
      <div className="lab-out p-3" aria-busy={status === 'loading'}>
        {status === 'idle' && (
          <div className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-soft">The tokenizers aren’t loaded yet. They’re about 1.5 MB together, downloaded once.</p>
            <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={load}>Load tokenizers</button>
          </div>
        )}
        {status === 'loading' && <p role="status" className="py-3 text-sm text-soft">Loading the two vocabularies…</p>}
        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-soft">
              Couldn’t load the tokenizers. Check your connection and try again.
              {attempts > 1 && ' Some browsers keep a failed download until the page reloads.'}
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={load}>Retry</button>
              {attempts > 1 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Reload page</button>}
            </div>
          </div>
        )}
        {status === 'ready' && (
          <div className="space-y-4">
            <dl className="grid gap-2 sm:grid-cols-2" aria-live="polite">
              {NAMES.map(n => (
                <div key={n} className={cn('rounded-(--r-sm) border p-2.5', n === view ? 'border-accent' : 'border-line')}>
                  <dt className="font-mono text-xs text-fg">{n} <span className="text-mute">· {ENCODINGS[n].models}</span></dt>
                  <dd className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold tabular-nums">{counts[n] ?? 0}</span>
                    <span className="text-xs text-mute">tokens{counts[n] ? ` · ${(chars / counts[n]!).toFixed(1)} characters per token` : ''}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <ChipChoice name={`${id}-view`} legend="Show the pieces from" options={NAMES} value={view} onChange={setView} />
              <label className="flex min-h-6 cursor-pointer items-center gap-1.5 text-xs text-soft">
                <input type="checkbox" checked={ids} onChange={e => setIds(e.target.checked)} className="accent-[var(--color-accent)]" /> token IDs
              </label>
            </div>

            {!text ? <Empty>Type something above, or pick an example.</Empty> : (
              <>
                <ol className="flex flex-wrap gap-1" aria-label={`${shown.length} tokens from ${view}`}>
                  {shown.map((p, i) => (
                    <li key={i} title={`token ${i + 1} · id ${p.id}${p.partial ? ' · part of a character' : ''}`}
                      className={cn('chip inline-flex flex-col items-center px-1.5 py-0.5 font-mono text-[0.8125rem] leading-snug',
                        p.partial ? 'border border-dashed border-mute text-mute' : i % 2 ? 'bg-accent-soft text-fg' : 'bg-chip text-fg')}>
                      <span className="whitespace-pre">{p.partial ? '▢' : show(p.text)}</span>
                      {ids && <span className="text-[0.625rem] text-soft">{p.id}</span>}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-mute">
                  · is a space. {partials > 0 && <>▢ marks {partials} {partials === 1 ? 'token that holds' : 'tokens that hold'} only part of a character’s bytes: the vocabulary has no single piece for it.</>}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2 text-sm leading-relaxed text-soft md:grid-cols-3">
        <Note label="Why counts differ">Each vocabulary is learned from its own training data with byte-pair encoding: frequent sequences become single tokens.</Note>
        <Note label="Indian languages">Scripts that were rarer in that data split into more, smaller pieces, sometimes partial characters. The bigger o200k vocabulary usually needs fewer.</Note>
        <Note label="Numbers">Both split digits into groups of at most three before encoding, so long numbers cost several tokens.</Note>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
