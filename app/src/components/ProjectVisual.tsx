import type { ReactNode } from 'react'

/**
 * Drawn diagrams for the three AI projects, shown in place of the static covers. Each one shows
 * how the project works, using only what the project card and case study say. They are
 * illustrations: no real documents, video, audio, scores or model output.
 *
 * Colours come from the theme tokens (Tailwind fill-/stroke- classes), so both themes and every
 * accent work. Motion lives in index.css (.pv-*), runs only with prefers-reduced-motion:
 * no-preference, and pauses off screen ([data-loop]). At rest each diagram shows its final state.
 * Labels are drawn at a fixed size: they scale with the diagram, not with the text-size control.
 */
const W = 400
const H = 300

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block aspect-[4/3] h-auto w-full bg-card">
      {children}
    </svg>
  )
}

const T = 'fill-mute font-mono text-[9px]'     // small label
const TS = 'fill-soft font-mono text-[10px]'   // stronger label

/* ---- RAG: ingest → retrieve → grounded answer ------------------------------------------------ */
function Rag() {
  const docs = ['Central rules', 'Gujarat', 'Delhi']
  // The Chroma store: 12 chunks; 4 central and 4 state chunks are retrieved.
  const chunks = Array.from({ length: 12 }, (_, i) => ({ i, hit: [0, 2, 3, 5].includes(i) ? 'central' : [7, 8, 10, 11].includes(i) ? 'state' : '' }))
  return (
    <Frame label="Illustration of the KnowYourRules RAG pipeline: official documents are chunked and embedded into a Chroma store; a question retrieves 4 central and 4 state chunks; the answer is written only from them and names its sources.">
      {/* column labels */}
      <text x="20" y="28" className={TS}>1 · ingest</text>
      <text x="150" y="28" className={TS}>2 · retrieve</text>
      <text x="282" y="28" className={TS}>3 · answer</text>

      {/* documents */}
      {docs.map((d, i) => (
        <g key={d}>
          <rect x="20" y={44 + i * 52} width="104" height="42" rx="5" className="fill-bg stroke-line-strong" />
          <text x="28" y={60 + i * 52} className="fill-fg font-mono text-[9.5px]">{d}</text>
          <rect x="28" y={68 + i * 52} width="70" height="3" rx="1.5" className="fill-line-strong" />
          <rect x="28" y={75 + i * 52} width="52" height="3" rx="1.5" className="fill-line-strong" />
        </g>
      ))}
      <text x="20" y="214" className={T}>LangChain chunks</text>
      <text x="20" y="227" className={T}>nomic-embed-text</text>
      <path d="M124 65 C140 65 136 120 150 120 M124 117 H150 M124 169 C140 169 136 120 150 120" className="stroke-line-strong" fill="none" />

      {/* question + store */}
      <rect x="150" y="40" width="112" height="26" rx="13" className="fill-accent-soft stroke-accent" />
      <text x="206" y="57" textAnchor="middle" className="fill-fg font-mono text-[9.5px]">question + state</text>
      <path d="M206 66 V82" className="stroke-accent" />
      <rect x="150" y="82" width="112" height="148" rx="6" className="fill-bg stroke-line-strong" />
      <text x="158" y="98" className={T}>Chroma</text>
      {chunks.map(c => {
        const x = 158 + (c.i % 3) * 32
        const y = 108 + Math.floor(c.i / 3) * 28
        return (
          <rect key={c.i} x={x} y={y} width="28" height="20" rx="3"
            className={c.hit === 'central' ? 'pv-hit fill-accent' : c.hit === 'state' ? 'pv-hit fill-accent/45' : 'fill-line'}
            style={c.hit ? { animationDelay: `${(c.i % 4) * 0.18}s` } : undefined} />
        )
      })}
      <text x="150" y="246" className={TS}>top 4 + 4</text>
      <rect x="150" y="254" width="8" height="8" rx="2" className="fill-accent" />
      <text x="162" y="262" className={T}>central</text>
      <rect x="208" y="254" width="8" height="8" rx="2" className="fill-accent/45" />
      <text x="220" y="262" className={T}>your state</text>

      {/* grounded answer */}
      <path d="M262 156 C272 156 270 120 282 120" className="stroke-accent" fill="none" />
      <rect x="282" y="44" width="100" height="186" rx="6" className="fill-bg stroke-accent" />
      <text x="290" y="62" className="fill-fg font-mono text-[9.5px]">answer</text>
      {[78, 88, 98, 108, 118, 128].map((y, i) => <rect key={y} x="290" y={y} width={i % 3 === 2 ? 52 : 82} height="4" rx="2" className="pv-line fill-soft" style={{ animationDelay: `${0.9 + i * 0.12}s` }} />)}
      <text x="290" y="152" className={T}>only from the</text>
      <text x="290" y="164" className={T}>retrieved text</text>
      <rect x="290" y="178" width="84" height="18" rx="9" className="fill-accent-soft" />
      <text x="332" y="190" textAnchor="middle" className="fill-fg font-mono text-[9.5px]">Source: …</text>
      <rect x="290" y="202" width="84" height="18" rx="9" className="fill-accent-soft" />
      <text x="332" y="214" textAnchor="middle" className="fill-fg font-mono text-[9.5px]">State: …</text>
      <text x="282" y="246" className={T}>Groq</text>
      <text x="282" y="258" className={T}>gpt-oss-120b</text>
    </Frame>
  )
}

/* ---- Computer vision: zone, boxes, feet points, and the inference flow ----------------------- */
function Cv() {
  const zone = '196,92 330,104 344,182 186,176'
  const flow = ['frame', 'YOLOv8', 'feet point', 'in zone?', 'clip · CSV']
  return (
    <Frame label="Illustration of AI Surveillance: on a camera frame, YOLOv8 puts boxes around people; each person's feet point is tested against a drawn restricted zone, and a person inside it triggers a saved clip, snapshot and CSV log entry.">
      {/* camera frame */}
      <rect x="16" y="16" width="368" height="196" rx="6" className="fill-bg stroke-line-strong" />
      {[48, 80, 112, 144, 176].map(y => <line key={y} x1="16" y1={y + 20} x2="384" y2={y + 20} className="stroke-line" />)}
      <path d="M26 36V26H36 M364 26H374V36 M374 192V202H364 M36 202H26V192" className="stroke-mute" fill="none" />
      <text x="44" y="34" className={T}>webcam · USB · RTSP · file</text>

      {/* restricted zone */}
      <polygon points={zone} className="fill-accent/10 stroke-accent" strokeDasharray="5 4" />
      <text x="264" y="196" textAnchor="middle" className="fill-accent font-mono text-[9px]">restricted zone</text>

      {/* people outside the zone */}
      {[[70, 150], [130, 128]].map(([x, y]) => (
        <g key={x}>
          <rect x={x - 14} y={y - 52} width="28" height="52" rx="2" className="stroke-mute" fill="none" strokeDasharray="3 2" />
          <circle cx={x} cy={y - 42} r="5.5" className="fill-soft" />
          <rect x={x - 6} y={y - 35} width="12" height="32" rx="5" className="fill-soft" />
          <circle cx={x} cy={y} r="3" className="fill-fg" />
          <text x={x - 14} y={y - 56} className={T}>person</text>
        </g>
      ))}

      {/* the person who walks into the zone (at rest: inside, flagged) */}
      <g className="pv-walk">
        <rect x="246" y="96" width="30" height="58" rx="2" className="pv-box stroke-accent" fill="none" strokeWidth="1.5" />
        <circle cx="261" cy="107" r="6" className="fill-soft" />
        <rect x="254.5" y="115" width="13" height="35" rx="5.5" className="fill-soft" />
        <circle cx="261" cy="154" r="3.5" className="pv-feet fill-accent" />
        <text x="246" y="90" className="pv-tag fill-accent font-mono text-[9px]">person · in zone</text>
      </g>

      {/* alert */}
      <g className="pv-alert">
        <rect x="248" y="44" width="112" height="20" rx="10" className="fill-accent" />
        <text x="304" y="57.5" textAnchor="middle" className="fill-accent-ink font-mono text-[9.5px]">intrusion → saved</text>
      </g>

      {/* inference flow */}
      <text x="16" y="236" className={TS}>per frame</text>
      {flow.map((f, i) => (
        <g key={f}>
          <rect x={16 + i * 76} y="246" width="64" height="30" rx="5" className={i === 3 ? 'fill-accent-soft stroke-accent' : 'fill-bg stroke-line-strong'} />
          <text x={48 + i * 76} y="264.5" textAnchor="middle" className="fill-fg font-mono text-[9px]">{f}</text>
          {i < flow.length - 1 && <path d={`M${80 + i * 76} 261h12`} className="stroke-mute" />}
        </g>
      ))}
    </Frame>
  )
}

/* ---- Speech: models → word-level ensemble → scored against a reference ---------------------- */
function Speech() {
  // Seven word slots. Blocks stand for words; no real transcript is shown.
  const widths = [30, 44, 24, 40, 34, 48, 30]
  const xs = widths.reduce<number[]>((a, _, i) => [...a, i === 0 ? 112 : a[i - 1] + widths[i - 1] + 5], [])
  // Where each model disagrees with the majority (d) or misses a word (m).
  const models: { name: string; odd: Record<number, 'd' | 'm'> }[] = [
    { name: 'Whisper', odd: { 1: 'd' } },
    { name: 'Indic-Conformer', odd: { 5: 'm' } },
    { name: 'Qwen3-ASR', odd: { 3: 'd' } },
  ]
  const wave = Array.from({ length: 44 }, (_, i) => 3 + Math.abs(Math.sin(i * 0.8) * Math.cos(i * 0.31)) * 13 + ((i * 7) % 5))
  return (
    <Frame label="Illustration of the railway speech-recognition pipeline: denoised, segmented audio goes to three models (Whisper, Indic-Conformer and Qwen3-ASR); a word-level ensemble takes the majority word in each slot; the result is scored against a reference transcript by substitutions, deletions and insertions to give WER and CER. No real audio or results are shown.">
      {/* audio */}
      <text x="16" y="28" className={TS}>audio → denoise → segment</text>
      {wave.map((h, i) => <rect key={i} x={16 + i * 8.4} y={52 - h} width="3" height={h * 2} rx="1.5" className={i > 6 && i < 38 ? 'fill-fg' : 'fill-line-strong'} />)}

      {/* model hypotheses */}
      {models.map((m, r) => (
        <g key={m.name}>
          <text x="16" y={98 + r * 24} className={T}>{m.name}</text>
          {xs.map((x, c) => {
            const odd = m.odd[c]
            return odd === 'm'
              ? <rect key={c} x={x} y={88 + r * 24} width={widths[c]} height="13" rx="3" className="stroke-mute" fill="none" strokeDasharray="3 2" />
              : <rect key={c} x={x} y={88 + r * 24} width={widths[c]} height="13" rx="3" className={odd === 'd' ? 'fill-mute' : 'fill-line-strong'} />
          })}
        </g>
      ))}
      {/* the vote, column by column (hidden at rest) */}
      {xs.map((x, c) => (
        <rect key={c} x={x - 2} y="83" width={widths[c] + 4} height="104" rx="4" className="pv-scan fill-accent/10" style={{ animationDelay: `${c * 0.6}s` }} />
      ))}

      {/* ensemble */}
      <text x="16" y="178" className="fill-accent font-mono text-[9.5px]">ensemble</text>
      <text x="16" y="190" className={T}>word-level vote</text>
      {xs.map((x, c) => <rect key={c} x={x} y="168" width={widths[c]} height="13" rx="3" className="fill-accent" />)}

      {/* scored against a reference */}
      <line x1="16" y1="206" x2="384" y2="206" className="stroke-line" />
      <text x="16" y="230" className={T}>reference</text>
      {xs.map((x, c) => <rect key={c} x={x} y="220" width={widths[c]} height="13" rx="3" className="fill-soft" />)}
      {[[3, 'S'], [5, 'D'], [6, 'I']].map(([c, k]) => (
        <text key={k} x={xs[c as number] + widths[c as number] / 2} y="250" textAnchor="middle" className="fill-accent font-mono text-[9.5px]">{k}</text>
      ))}
      <text x="16" y="274" className="fill-fg font-mono text-[10.5px]">WER = (S + D + I) / N</text>
      <text x="16" y="290" className={T}>CER: the same per character · scored with jiwer</text>
    </Frame>
  )
}

const VISUALS = { rag: Rag, cv: Cv, speech: Speech }

/** Short titles for the strip above each diagram. */
export const VISUAL_TITLES = { rag: 'Ingest → retrieve → answer', cv: 'Zone · boxes · inference', speech: 'Models → ensemble → WER' }

export function ProjectVisual({ kind }: { kind: keyof typeof VISUALS }) {
  const V = VISUALS[kind]
  return <V />
}
