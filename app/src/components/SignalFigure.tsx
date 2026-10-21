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

export function SignalFigure() {
  return (
    <figure className="signal surface overflow-hidden" aria-labelledby="signal-title">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <p id="signal-title" className="t-kicker text-fg">{signalFigure.title}</p>
        <p className="t-kicker">Illustration</p>
      </div>

      <div className="px-3 pt-3 sm:px-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
          {/* baseline */}
          <line x1="0" y1={MID} x2={W} y2={MID} className="stroke-line" strokeWidth="1" />
          {/* the recording as it arrives: speech buried in noise */}
          <g className="fill-line-strong">
            {bars.map(b => <rect key={`n${b.x}`} x={b.x - 1} y={MID - b.noisy} width="2" height={b.noisy * 2} rx="1" />)}
          </g>
          {/* the signal that's left after denoising */}
          <g className="fill-fg">
            {bars.filter(b => b.clean > 0.5).map(b => <rect key={`c${b.x}`} x={b.x - 1} y={MID - b.clean} width="2" height={b.clean * 2} rx="1" />)}
          </g>
          {/* voiced segments found by voice-activity detection */}
          <g className="stroke-accent" strokeWidth="1.5" fill="none">
            {SEGMENTS.map(([a, b]) => (
              <path key={a} d={`M${a * W} ${H - 34}v6h${(b - a) * W}v-6`} />
            ))}
          </g>
          <g className="fill-mute font-mono text-[0.875rem]">
            {SEGMENTS.map(([a, b], i) => (
              <text key={a} x={((a + b) / 2) * W} y={H - 12} textAnchor="middle">{`segment ${i + 1}`}</text>
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
