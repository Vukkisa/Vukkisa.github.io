import type { CSSProperties, ReactNode } from 'react'

/**
 * Line-drawn cartoons for three of the projects (AI Surveillance keeps its drawn camera diagram), shown in place of the static covers. Each one is a
 * small story in two beats, like a title-card gag: the setup in the top panel, the step happening
 * in the bottom panel, with a banner between them that names the step. The same round-headed
 * character appears on every card and wears a cap that fits the project. They show only what the
 * project card and case study say: no real documents, video, audio, scores or model output.
 *
 * Colours come from the theme tokens (Tailwind fill-/stroke- classes), so both themes and every
 * accent work. Motion lives in index.css (.pv-scene): the steps take turns, only with
 * prefers-reduced-motion: no-preference, and pause off screen ([data-loop]). At rest each cartoon
 * shows its last step. Labels are drawn at a fixed size: they scale with the drawing.
 */
const W = 400
const H = 300

/** `h` is the drawing's height; the cards show a 16:10 window, so a diagram that must show everything uses 250. */
function Frame({ label, children, h = H }: { label: string; children: ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label} style={{ aspectRatio: `${W} / ${h}` }} className="block h-auto w-full bg-card">
      {children}
    </svg>
  )
}

const T = 'fill-mute font-mono text-[9px]'     // small label
const TS = 'fill-soft font-mono text-[10px]'   // stronger label
const INK = 'fill-none stroke-fg'
const IDLE_ARMS = 'M190 136L182 164 M210 136L218 164'

type Hat = 'grad' | 'police' | 'guard' | 'railway'

/** A cap for each project: a graduation cap, a traffic-police cap, a guard's cap, a railway cap. */
function HatArt({ hat }: { hat: Hat }) {
  if (hat === 'grad') return <g className={INK}><path d="M183 94L200 85L217 94L200 103Z" className="fill-bg stroke-fg" /><path d="M214 96V108" /></g>
  if (hat === 'police') return <g className={INK}><path d="M187 95Q200 80 213 95Z" className="fill-bg stroke-fg" /><path d="M187 95H226" /></g>
  if (hat === 'guard') return <g className={INK}><path d="M187 95Q200 80 213 95Z" className="fill-bg stroke-fg" /><path d="M187 95H226" /><circle cx="200" cy="90" r="2.4" className="fill-fg stroke-none" /></g>
  return <g className={INK}><path d="M186 95Q200 78 214 95Z" className="fill-bg stroke-fg" /><path d="M186 95H214" /><circle cx="200" cy="88" r="3" /></g>
}

/** The learner at a desk. `arms` and `props` change per step; everything else is the same drawing. */
function Toon({ hat, arms, props }: { hat: Hat; arms: string; props?: ReactNode }) {
  return (
    <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g className={INK}>
        <circle cx="200" cy="106" r="14" className="fill-bg stroke-fg" />
        <path d="M186 164L190 130Q200 122 210 130L214 164" />
        <path d={arms} />
      </g>
      <circle cx="195" cy="106" r="1.6" className="fill-fg" />
      <circle cx="206" cy="106" r="1.6" className="fill-fg" />
      <path d="M196 113q5 4 10 0" className="fill-none stroke-fg" />
      <HatArt hat={hat} />
      {props}
      <path d="M96 168H304 M112 168V190 M288 168V190" className="fill-none stroke-fg" />
    </g>
  )
}

type Step = { cap: string; arms: string; props: ReactNode }

/** Five steps, one at a time: the waiting character above, the step happening below. */
function Story({ label, hat, steps }: { label: string; hat: Hat; steps: Step[] }) {
  return (
    <Frame label={label}>
      <g transform="translate(52 -52)"><g transform="scale(.74)"><Toon hat={hat} arms={IDLE_ARMS} /></g></g>
      {steps.map((sc, i) => (
        <g key={i} className="pv-scene" style={{ animationDelay: `${i * 2.4}s` }}>
          <g transform="translate(52 76)"><g transform="scale(.74)"><Toon hat={hat} arms={sc.arms} props={sc.props} /></g></g>
          <ellipse cx="200" cy="116" rx="156" ry="17" className="fill-accent-soft" />
          <text x="200" y="120" textAnchor="middle" className="fill-fg font-mono text-[11.5px]">{sc.cap}</text>
        </g>
      ))}
    </Frame>
  )
}

const DOWN = 'M190 136L178 164 M210 136L222 164'
/* ---- KnowYourRules: read the sources, index them, take a question, answer from them or decline -- */
function Rag() {
  const steps: Step[] = [
    { cap: 'Official sources', arms: DOWN, props: (
      <g className={INK}><rect x="172" y="156" width="56" height="12" rx="1" /><rect x="176" y="146" width="48" height="10" rx="1" /><rect x="180" y="137" width="40" height="9" rx="1" /><path d="M186 162h28 M188 151h22" /></g>) },
    { cap: 'Index by section', arms: DOWN, props: (
      <g className={INK}>{[156, 186, 216].map(x => <g key={x}><rect x={x - 4} y="146" width="26" height="22" rx="2" /><path d={`M${x} 154h18 M${x} 160h12`} /></g>)}</g>) },
    { cap: 'A question arrives', arms: 'M212 134L232 122 M188 134L174 162', props: (
      <g className={INK}><ellipse cx="256" cy="96" rx="22" ry="14" /><path d="M240 106l-6 10l14-6" /><text x="256" y="102" textAnchor="middle" className="fill-fg stroke-none font-mono text-[16px]">?</text></g>) },
    { cap: 'Answer from sources, checked', arms: 'M190 136L182 160 M210 136L224 150', props: (
      <g className={INK}><rect x="168" y="138" width="50" height="30" rx="2" /><path d="M175 148h30 M175 156h22 M176 163l4 4 8-9" /><rect x="226" y="132" width="36" height="14" rx="7" className="fill-accent-soft stroke-accent" /><text x="244" y="142" textAnchor="middle" className="fill-fg stroke-none font-mono text-[8px]">source</text></g>) },
    { cap: 'Unsupported? It declines', arms: 'M212 134L238 118 M188 134L174 162', props: (
      <g className={INK}><rect x="228" y="84" width="64" height="22" rx="11" className="fill-accent-soft stroke-accent" /><text x="260" y="98" textAnchor="middle" className="fill-fg stroke-none font-mono text-[9px]">not covered</text></g>) },
  ]
  return <Story hat="police" steps={steps} label="Illustration of the KnowYourRules RAG pipeline as a line-drawn cartoon: the assistant reads official sources, indexes them by section, takes a question, answers only from those sources with a source label and a check, and declines when the sources don't support an answer." />
}

/** The same round-headed line figure as the other cards, standing with its feet at (x, y). */
function Figure({ x, y }: { x: number; y: number }) {
  return (
    <g className="fill-none stroke-fg" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x} cy={y - 45} r="6.5" className="fill-bg stroke-fg" />
      <circle cx={x - 2.4} cy={y - 45.5} r="0.9" className="fill-fg stroke-none" />
      <circle cx={x + 2.4} cy={y - 45.5} r="0.9" className="fill-fg stroke-none" />
      <path d={`M${x - 2} ${y - 42}q2 1.6 4 0 M${x} ${y - 38.5}V${y - 17} M${x - 9} ${y - 25}L${x} ${y - 33}L${x + 9} ${y - 25} M${x} ${y - 17}L${x - 6} ${y} M${x} ${y - 17}L${x + 6} ${y}`} />
    </g>
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
          <Figure x={x} y={y} />
          <circle cx={x} cy={y} r="3" className="fill-fg" />
          <text x={x - 14} y={y - 56} className={T}>person</text>
        </g>
      ))}

      {/* the person who walks into the zone (at rest: inside, flagged) */}
      <g className="pv-walk">
        <rect x="246" y="96" width="30" height="58" rx="2" className="pv-box stroke-accent" fill="none" strokeWidth="1.5" />
        <Figure x={261} y={154} />
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

/* ---- Railway speech: a person speaks into a handset, the audio is cleaned and transcribed, the words appear ---- */
/** Words as short pen strokes, three lines. Not real text: no transcript is shown or implied. */
const TRANSCRIPT: number[][] = [[30, 22, 40, 26, 34, 24], [36, 28, 20, 42, 30], [26, 38, 24, 32]]
const word = (x: number, y: number, w: number) => `M${x} ${y}q${w / 4} -3 ${w / 2} 0t${w / 2} 0`

function Speech() {
  return (
    <Frame h={250} label="Illustration of the railway speech-recognition pipeline as a line-drawn cartoon: a person speaks into a handset, the noisy railway audio travels through a cleaning stage and a speech-to-text stage, and the spoken words appear line by line as a text transcript. Indic-Conformer is still being fine-tuned; word and character error rates have not been measured yet.">
      <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-fg">
        {/* locomotive cabin */}
        <rect x="16" y="34" width="130" height="100" rx="6" className="fill-bg stroke-line-strong" />
        <path d="M16 122H146" className="stroke-line-strong" />
        <rect x="96" y="42" width="40" height="22" rx="3" className="fill-card" />
        <path d="M104 60L112 46 M128 60L120 46" className="stroke-mute" strokeWidth="1.4" />
        {/* the radio on the wall */}
        <rect x="100" y="70" width="38" height="26" rx="3" className="fill-card" />
        <path d="M106 78h14 M106 83h14 M106 88h14" />
        <circle cx="129" cy="80" r="4" /><circle cx="129" cy="89" r="2.2" />
        {/* the employee: railway cap, handset to the mouth, cord to the radio */}
        <circle cx="52" cy="92" r="6.5" className="fill-bg" />
        <path d="M46 88Q52 80 58 88Z M46 88H60 M52 98V112 M52 112L46 122 M52 112L58 122 M52 101L43 111 M52 101L63 99L64 100" />
        <rect x="60" y="86" width="7" height="14" rx="3" className="fill-bg" />
        <path d="M64 100q6 12 22 4t22-8" className="stroke-mute" strokeWidth="1.6" />
        <circle cx="50" cy="91" r="1" className="fill-fg stroke-none" />
        <circle cx="55" cy="91" r="1" className="fill-fg stroke-none" />
        {/* two small gauges on the control panel */}
        <circle cx="122" cy="108" r="5" className="stroke-mute" /><circle cx="136" cy="108" r="5" className="stroke-mute" />
      </g>
      <text x="24" y="130" className={T}>railway audio</text>

      {/* sound leaving the radio */}
      <g className="fill-none stroke-accent" strokeWidth="1.8" strokeLinecap="round">
        {['M144 77q5 6 0 12', 'M150 73q8 10 0 20', 'M156 69q11 14 0 28'].map((d, k) => <path key={k} d={d} className="signal-arc" style={{ '--k': k } as CSSProperties} />)}
      </g>

      {/* the pipeline: cleaning, then speech-to-text */}
      <rect x="198" y="66" width="60" height="34" rx="5" className="sp-n1 fill-bg stroke-line-strong" />
      <text x="228" y="86" textAnchor="middle" className="fill-fg font-mono text-[9px]">denoise</text>
      <rect x="276" y="66" width="76" height="34" rx="5" className="sp-n2 fill-bg stroke-line-strong" />
      <text x="314" y="86" textAnchor="middle" className="fill-fg font-mono text-[9px]">transcribe</text>
      <text x="162" y="112" className={T}>noisy audio</text>
      <text x="322" y="126" className={T}>text</text>

      {/* the audio's route, drawn with the pen: noisy at the radio, clean after the denoiser, down to the transcript */}
      <path pathLength={1} className="sp-route fill-none stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M162 83l4-7 4 14 4-16 4 14 4-9 4 10 4-6 4 4 H198 M258 83H264q3-6 6 0t6 0 M314 100V152 M308 146l6 6 6-6" />

      {/* the transcript card; the words appear a line at a time */}
      <rect x="16" y="156" width="368" height="86" rx="6" className="fill-bg stroke-line-strong" />
      <text x="28" y="171" className={T}>transcript</text>
      <g className="fill-none stroke-fg" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {TRANSCRIPT.map((ws, li) => {
          let x = 28
          return (
            <g key={li} className={`sp-line sp-l${li + 1}`}>
              {ws.map((w, wi) => { const d = word(x, 188 + li * 15, w); x += w + 9; return <path key={wi} d={d} /> })}
            </g>
          )
        })}
      </g>
      <text x="28" y="234" className={T}>fine-tuning ongoing: error rates not measured yet</text>
    </Frame>
  )
}

/* ---- Ez-Learn: sign up, learn, quiz, pay, certificate ---------------------------------------- */
function Learn() {
  const steps: Step[] = [
    { cap: 'Sign up · email code', arms: 'M212 134L238 120 M188 134L174 162', props: (
      <g className={INK}><rect x="236" y="92" width="34" height="22" rx="2" /><path d="M236 94l17 12 17-12" /></g>) },
    { cap: 'Learn · course content', arms: DOWN, props: (
      <g className={INK}><path d="M166 166L200 158L234 166V148L200 140L166 148Z M200 158V140" /><path d="M174 152l20 5 M174 158l20 5 M206 157l20-5 M206 163l20-5" /></g>) },
    { cap: 'Quiz · scored', arms: 'M190 136L182 160 M210 136L226 150', props: (
      <g className={INK}><rect x="168" y="138" width="50" height="30" rx="2" /><path d="M175 148l3 3 5-6 M175 159l3 3 5-6 M188 148h22 M188 159h22 M226 150l14-16" /></g>) },
    { cap: 'Pay · Razorpay', arms: 'M212 134L246 140 M188 134L174 162', props: (
      <g className={INK}><rect x="244" y="126" width="38" height="26" rx="3" /><path d="M244 135h38 M250 145h12" /></g>) },
    { cap: 'Certificate', arms: 'M188 134L174 146 M212 134L226 146', props: (
      <g className={INK}><rect x="170" y="138" width="58" height="30" rx="2" /><path d="M178 148h42 M178 155h30" /><circle cx="214" cy="160" r="5" className="fill-accent-soft stroke-accent" /><path d="M244 100l10-6 M248 112h12 M240 88l4-9" /></g>) },
  ]
  return <Story hat="grad" steps={steps} label="Illustration of Ez-Learn as a line-drawn cartoon: a learner in a graduation cap signs up with an email code, studies the course, takes a scored quiz, pays through Razorpay and earns a certificate. It runs on Django and PostgreSQL and is deployed on Render." />
}

const VISUALS = { rag: Rag, cv: Cv, speech: Speech, learn: Learn }

/** Short titles for the strip above each diagram. */
export const VISUAL_TITLES = { rag: 'Ask → check → answer', cv: 'Zone · boxes · inference', speech: 'Noise → text → score', learn: 'Sign up → learn → certify' }

export function ProjectVisual({ kind }: { kind: keyof typeof VISUALS }) {
  const V = VISUALS[kind]
  return <V />
}
