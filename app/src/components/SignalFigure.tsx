import type { CSSProperties } from 'react'
import { signalFigure } from '../data/content'

/**
 * The hero's technical visual: a stylised speech pipeline. A faint "noisy" waveform sits behind
 * the clean signal; brackets mark the voiced segments; one playhead sweeps across while the four
 * stages below take turns being active. It is an illustration (generated shapes, not audio).
 *
 * Everything readable is plain HTML, visible at rest. Motion is defined only for
 * prefers-reduced-motion: no-preference, and pauses off screen (the hero is a [data-loop] area).
 */
const W = 480
const H = 150
const MID = 62
const BARS = 96
/** Voiced stretches, as fractions of the clip. */
const SEGMENTS: [number, number][] = [[0.05, 0.3], [0.37, 0.56], [0.64, 0.93]]

// Deterministic pseudo-noise so the drawing is identical on every load.
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const step = W / BARS
const bars = Array.from({ length: BARS }, (_, i) => {
  const t = (i + 0.5) / BARS
  const seg = SEGMENTS.find(([a, b]) => t >= a && t <= b)
  // Speech: a smooth envelope per segment with syllable-like ripples. Silence: nothing.
  const env = seg ? Math.sin(((t - seg[0]) / (seg[1] - seg[0])) * Math.PI) : 0
  const clean = env * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)))
  const noisy = Math.min(1, clean + 0.18 + noise(i) * 0.32)
  return { x: i * step + step / 2, clean: clean * 46, noisy: noisy * 46 }
})

const X0 = 190, X1 = 472
const px = (x: number) => X0 + (x / W) * (X1 - X0)
const noisyPath = (() => {
  const top = bars.map(b => `${px(b.x).toFixed(1)} ${(MID - b.noisy * 0.7).toFixed(1)}`)
  const bottom = bars.map(b => `${px(b.x).toFixed(1)} ${(MID + b.noisy * 0.7).toFixed(1)}`)
  return `M${top.join('L')} M${bottom.join('L')}`
})()
const cleanPaths = SEGMENTS.flatMap(([a, c]) => {
  const inSeg = bars.filter(b => b.x / W >= a && b.x / W <= c && b.clean > 0.5)
  if (inSeg.length < 2) return []
  const top = inSeg.map(b => `${px(b.x).toFixed(1)} ${(MID - b.clean).toFixed(1)}`)
  const bottom = inSeg.map(b => `${px(b.x).toFixed(1)} ${(MID + b.clean).toFixed(1)}`)
  return [`M${top.join('L')}`, `M${bottom.join('L')}`]
})

export function SignalFigure() {
  return (
    <figure className="signal surface overflow-hidden" aria-labelledby="signal-title">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <p id="signal-title" className="sr-only">{signalFigure.title}</p>
        <p className="t-kicker">Illustration</p>
      </div>

      <div className="px-3 pt-3 sm:px-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
          {/* a steam train with a person speaking from a coach window: sound leaves it, noisy */}
          <path d="M2 122H170" className="stroke-line-strong" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <g className="signal-train fill-none stroke-fg" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* engine: boiler, chimney, cab, cowcatcher and driving wheels */}
            <rect x="8" y="64" width="38" height="32" rx="9" className="fill-card" />
            <path d="M15 64V50H23V64 M12 50H26" className="fill-card" />
            <path d="M33 64q4-8 8 0" />
            <rect x="46" y="50" width="22" height="46" rx="2" className="fill-card" />
            <path d="M43 50H71" />
            <rect x="52" y="58" width="10" height="14" rx="2" />
            <circle cx="9" cy="80" r="2.4" />
            <path d="M8 96L2 108H18" />
            <path d="M8 98H70" />
            <circle cx="30" cy="109" r="10" className="fill-card" />
            <circle cx="52" cy="109" r="10" className="fill-card" />
            <path d="M30 109H52" />
            <circle cx="30" cy="109" r="1.5" className="fill-fg stroke-none" />
            <circle cx="52" cy="109" r="1.5" className="fill-fg stroke-none" />
            {/* coach */}
            <path d="M68 96H72" />
            <rect x="72" y="58" width="80" height="42" rx="5" className="fill-card" />
            <path d="M72 66H152" />
            <rect x="78" y="70" width="14" height="18" rx="2" />
            <rect x="97" y="70" width="14" height="18" rx="2" />
            <rect x="119" y="66" width="26" height="26" rx="3" className="fill-bg" />
            <circle cx="132" cy="77" r="7.5" className="fill-card" />
            <path d="M124 74Q132 63 140 74Z M124 74H144" className="fill-card" />
            <path d="M123 92Q132 85 141 92" />
            {/* walkie-talkie held up to the mouth, aerial sticking out of the window */}
            <path d="M137 91L142 88" />
            <rect x="141" y="75" width="7" height="14" rx="1.8" className="fill-card" />
            <path d="M145 75V63 M143 80h3 M143 83h3" />
            <path d="M72 104H152" />
            <circle cx="90" cy="112" r="7" className="fill-card" />
            <circle cx="134" cy="112" r="7" className="fill-card" />
          </g>
          <circle cx="129" cy="78" r="1.3" className="fill-fg" />
          <circle cx="135" cy="78" r="1.3" className="fill-fg" />
          <ellipse cx="133" cy="82.5" rx="2" ry="1.5" className="fill-fg" />
          <g className="fill-none stroke-accent" strokeWidth="1.8" strokeLinecap="round">
            <path d="M156 71q5 6 0 12" className="signal-arc" style={{ '--k': 0 } as CSSProperties} />
            <path d="M163 67q8 10 0 20" className="signal-arc" style={{ '--k': 1 } as CSSProperties} />
            <path d="M170 63q11 14 0 28" className="signal-arc" style={{ '--k': 2 } as CSSProperties} />
          </g>
          {/* baseline */}
          <line x1={X0} y1={MID} x2={X1} y2={MID} className="stroke-line-strong" strokeWidth="1.4" strokeLinecap="round" />
          {/* the recording as it arrives: speech buried in noise */}
          <path d={noisyPath} className="stroke-mute" fill="none" strokeWidth="1" strokeLinejoin="round" opacity=".7" />
          {/* the signal that's left after denoising, drawn as a pen outline */}
          <g className="stroke-fg" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {cleanPaths.map(d => <path key={d} d={d} />)}
          </g>
          {/* the transcript, written line by line above each segment as the playhead passes */}
          <g className="stroke-fg" strokeWidth="1.6" strokeLinecap="round" fill="none">
            {SEGMENTS.map(([a, b]) => (
              <g key={a} className="signal-text" style={{ '--t': `${(b * 9).toFixed(1)}s` } as CSSProperties}>
                <path d={`M${px(a * W) + 6} 8h${(px(b * W) - px(a * W)) * 0.8}`} />
                <path d={`M${px(a * W) + 6} 15h${(px(b * W) - px(a * W)) * 0.55}`} />
              </g>
            ))}
          </g>
          {/* voiced segments found by voice-activity detection */}
          <g className="stroke-accent" strokeWidth="1.5" fill="none">
            {SEGMENTS.map(([a, b]) => (
              <path key={a} d={`M${px(a * W)} ${H - 34}v6h${px(b * W) - px(a * W)}v-6`} />
            ))}
          </g>
          <g className="fill-mute font-mono text-[0.75rem]">
            {SEGMENTS.map(([a, b], i) => (
              <text key={a} x={px(((a + b) / 2) * W)} y={H - 12} textAnchor="middle">{`segment ${i + 1}`}</text>
            ))}
          </g>
          {/* the playhead: one slow sweep, the page's only looping motion */}
          <g className="signal-head">
            <rect x="-14" y="6" width="28" height={MID * 2 - 12} className="fill-accent/10" />
            <line x1="0" y1="6" x2="0" y2={MID * 2 - 6} className="stroke-accent" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      <ol className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        {signalFigure.stages.map((s, i) => (
          <li key={s.name} className="signal-stage bg-card px-3 py-3 sm:px-4" style={{ '--k': i } as CSSProperties}>
            <p className="font-mono text-[0.6875rem] text-mute">{String(i + 1).padStart(2, '0')}</p>
            <p className="mt-0.5 text-sm font-medium text-fg">{s.name}</p>
            <p className="mt-0.5 text-xs leading-snug text-soft">{s.detail}</p>
          </li>
        ))}
      </ol>

      <figcaption className="border-t border-line px-4 py-2.5 text-xs text-mute">{signalFigure.caption}</figcaption>
    </figure>
  )
}
