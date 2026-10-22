import { useId, useMemo, useState, type FormEvent } from 'react'
import { siteDocs } from '../data/corpus'
import { buildIndex, buildPrompt, chunkDocs, extractAnswer, queryVector, retrieve, topTerms } from '../lib/rag'
import { cn } from '../lib/utils'
import { ChipChoice, Empty, Note } from './lab/LabUI'

/**
 * RAG, step by step. A real (small) retrieval pipeline runs in the browser over this site's own
 * text: chunking, a TF-IDF index, cosine-similarity retrieval, context assembly and an extractive
 * answer. No language model runs and nothing is sent anywhere. Each stage also says how
 * KnowYourRules does it (facts from the team repository, as in the project's case study).
 */
const STAGES = [
  {
    name: 'Ingest',
    what: 'Collect the documents to search. Here: the text of this site’s projects and journey.',
    kyr: 'Official documents: the central Motor Vehicles Act and Rules, Gujarat and Delhi.',
  },
  {
    name: 'Chunk',
    what: 'Split each document into pieces small enough to retrieve on their own, at sentence boundaries. Each chunk repeats the previous one’s last sentence, so a fact near a boundary stays in one piece.',
    kyr: 'Chunked with LangChain.',
  },
  {
    name: 'Embed & index',
    what: 'Turn every chunk into a vector and store them for fast search. This demo uses TF-IDF keyword vectors: each word gets a weight, rarer words weigh more.',
    kyr: 'Dense neural embeddings from Ollama (nomic-embed-text), stored in a Chroma vector store. They match meaning, not just shared words.',
  },
  {
    name: 'Retrieve',
    what: 'Turn the question into a vector the same way and rank chunks by cosine similarity. The top four go forward.',
    kyr: '4 chunks from the central rules, plus 4 from your state’s rules when that state is indexed.',
  },
  {
    name: 'Select context',
    what: 'Label the retrieved chunks with their source and wrap them in a prompt that allows answers only from that context.',
    kyr: 'Chunks are labelled with source and state inside a strict prompt.',
  },
  {
    name: 'Answer',
    what: 'A model writes the answer from the context. No model runs here, so this demo shows the retrieved sentence that best matches your question instead.',
    kyr: 'Groq (gpt-oss-120b) answers and names its sources, or says the knowledge base doesn’t cover the question. Accuracy hasn’t been evaluated yet.',
  },
] as const

const EXAMPLES = [
  'Which models were benchmarked?',
  'What is indexed so far?',
  'Where did Jayanth work as a Data Developer?',
  'What is the capital of France?',
]
const SIZES = [40, 60, 90] as const
const K = 4
const fmt = (n: number) => n.toLocaleString('en-IN')

export function RagFlow() {
  const [step, setStep] = useState(0)
  const [size, setSize] = useState<(typeof SIZES)[number]>(60)
  const [draft, setDraft] = useState(EXAMPLES[0])
  const [question, setQuestion] = useState(EXAMPLES[0])
  const [error, setError] = useState('')
  const id = useId()

  const chunks = useMemo(() => chunkDocs(siteDocs, size, true), [size])
  const index = useMemo(() => buildIndex(chunks), [chunks])
  const hits = useMemo(() => (question ? retrieve(index, question, K) : []), [index, question])
  const answer = useMemo(() => extractAnswer(index, hits, question), [index, hits, question])
  const qTerms = useMemo(() => [...queryVector(index, question).keys()], [index, question])
  const words = siteDocs.reduce((a, d) => a + d.text.split(/\s+/).length, 0)
  const shown = hits[0] ? index.chunks.indexOf(hits[0].chunk) : 0

  const ask = (e?: FormEvent, q = draft) => {
    e?.preventDefault()
    if (!q.trim()) { setError('Type a question first, or pick an example.'); return }
    setError('')
    setDraft(q)
    setQuestion(q.trim())
    setStep(s => Math.max(s, 3))
  }
  const reset = () => { setStep(0); setSize(60); setDraft(EXAMPLES[0]); setQuestion(EXAMPLES[0]); setError('') }
  const stage = STAGES[step]

  return (
    <div className="space-y-5">
      <Note label="Real, in your browser" tone="accent">
        This runs a small retrieval pipeline over this site’s own text. Retrieval and scores are computed live; no language model runs and nothing is sent anywhere.
      </Note>

      {/* input */}
      <form onSubmit={ask} className="space-y-2" noValidate>
        <label htmlFor={`${id}-q`} className="lab-label">Question</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={`${id}-q`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className="lab-field"
            maxLength={200}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary btn-sm shrink-0">Ask</button>
        </div>
        {error && <p id={`${id}-err`} role="alert" className="text-sm text-accent">{error}</p>}
        <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Example questions" role="group">
          {EXAMPLES.map(q => (
            <button key={q} type="button" onClick={() => ask(undefined, q)} className="chip border border-line px-2 py-1 text-left text-xs text-soft transition-colors hover:border-line-strong hover:text-fg">{q}</button>
          ))}
        </div>
      </form>

      {/* stepper */}
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="Pipeline stages">
        {STAGES.map((s, i) => (
          <li key={s.name}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              className={cn('chip w-full border px-2 py-2 text-left transition-colors', i === step ? 'border-accent bg-accent-soft' : i < step ? 'border-line-strong' : 'border-line hover:border-line-strong')}
            >
              <span className={cn('block font-mono text-[0.6875rem]', i === step ? 'text-fg' : i < step ? 'text-accent' : 'text-mute')}>{String(i + 1).padStart(2, '0')}</span>
              <span className="block text-xs font-medium text-fg">{s.name}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* current stage */}
      <section aria-labelledby={`${id}-stage`} className="rag-panel space-y-3" key={step}>
        <h4 id={`${id}-stage`} className="text-[0.9375rem] font-medium" aria-live="polite">
          <span className="sr-only">Stage {step + 1} of {STAGES.length}: </span>{stage.name}
        </h4>
        <p className="text-sm leading-relaxed text-soft">{stage.what}</p>

        {/* Scrolls when long, so it's focusable for keyboard scrolling. */}
        <div className="lab-out max-h-80 overflow-auto p-3 text-sm" tabIndex={0} role="group" aria-label={`${stage.name} output`}>
          {step === 0 && (
            <>
              <p className="lab-label mb-2">{siteDocs.length} documents · {fmt(words)} words</p>
              <ul className="divide-y divide-line">
                {siteDocs.map(d => (
                  <li key={d.id} className="flex justify-between gap-4 py-1.5 text-soft">
                    <span>{d.title}</span><span className="font-mono text-xs tabular-nums text-mute">{d.text.split(/\s+/).length} words</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <ChipChoice name={`${id}-size`} legend="Chunk size (whole sentences, one sentence of overlap)" options={SIZES} value={size} onChange={setSize} labels={v => `up to ${v} words`} />
              <p className="lab-label mb-2 mt-3">{chunks.length} chunks · first three</p>
              <ol className="space-y-2">
                {chunks.slice(0, 3).map(c => (
                  <li key={c.id} className="rounded-(--r-sm) bg-chip p-2 text-xs leading-relaxed text-soft">
                    <span className="mr-2 font-mono text-accent">{c.id}</span>{c.text}
                  </li>
                ))}
              </ol>
            </>
          )}

          {step === 2 && (
            <>
              <p className="lab-label mb-2">Vocabulary {fmt(index.idf.size)} terms · each chunk is a {fmt(index.idf.size)}-dimensional sparse vector</p>
              <p className="mb-2 text-xs text-mute">Strongest terms in <span className="font-mono text-accent">{index.chunks[shown].id}</span> ({hits[0] ? 'your top match' : 'the first chunk'}):</p>
              <ul className="space-y-1.5">
                {topTerms(index, shown, 6).map(([t, w]) => (
                  <li key={t} className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-2 font-mono text-xs">
                    <span className="truncate text-fg">{t}</span>
                    <span className="h-1.5 rounded-full bg-line"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round(w * 100)}%` }} /></span>
                    <span className="text-right tabular-nums text-mute">{w.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 3 && (
            !question ? <Empty>Type a question above to retrieve chunks.</Empty> : (
              <>
                <p className="mb-2 text-xs text-mute">
                  Question terms in the index: {qTerms.length ? qTerms.map(t => <span key={t} className="mr-1 font-mono text-fg">{t}</span>) : <span className="text-fg">none</span>}
                </p>
                {hits.length === 0 ? <Empty>No chunk shares a word with this question, so nothing is retrieved.</Empty> : (
                  <ol className="space-y-2">
                    {hits.map((h, i) => (
                      <li key={h.chunk.id} className="rounded-(--r-sm) bg-chip p-2">
                        <div className="flex items-center justify-between gap-3 font-mono text-xs">
                          <span className="text-accent">{i + 1}. {h.chunk.id}</span>
                          <span className="tabular-nums text-fg">cosine {h.score.toFixed(3)}</span>
                        </div>
                        <span className="mt-1 block h-1 rounded-full bg-line"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((h.score / hits[0].score) * 100)}%` }} /></span>
                        <p className="mt-1.5 line-clamp-2 text-xs text-soft">{h.chunk.text}</p>
                        <p className="mt-1 font-mono text-[0.6875rem] text-mute">shared: {h.shared.join(', ')}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )
          )}

          {step === 4 && <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-soft">{buildPrompt(hits, question)}</pre>}

          {step === 5 && (
            answer ? (
              <div className="space-y-2">
                <p className="lab-label">Best-matching retrieved sentence (extractive, not generated)</p>
                <blockquote className="border-l-2 border-accent pl-3 text-[0.9375rem] leading-relaxed text-fg">{answer.sentence}</blockquote>
                <p className="font-mono text-xs text-mute">Source: {answer.source.title} · chunk {answer.source.n}</p>
              </div>
            ) : <Empty>The context doesn’t cover this question, so there’s nothing to answer from. That’s the honest response a grounded system should give.</Empty>
          )}
        </div>

        <Note label="In KnowYourRules">{stage.kyr}</Note>
      </section>

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="font-mono text-[0.6875rem] text-mute">Stage {step + 1} of {STAGES.length}</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>Back</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)} disabled={step === STAGES.length - 1}>Next stage</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
        </div>
      </div>
      <p className="text-xs text-mute">In the real project I built this RAG pipeline; the team backend asks for your state and rewrites follow-up questions.</p>
    </div>
  )
}
