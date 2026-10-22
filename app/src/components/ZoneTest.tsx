import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { clampPoint, inside, rayCrossings, type Pt } from '../lib/geometry'
import { cn } from '../lib/utils'
import { ChipChoice, Note } from './lab/LabUI'

/**
 * The zone check from AI Surveillance, re-created in the browser on a synthetic scene. A person's
 * feet point (the bottom-centre of their box) is tested against a polygon you draw, with the
 * ray-casting rule drawn out. Only the geometry is real: there's no camera and no detector (the
 * box is drawn, not detected), and the event log is simulated.
 */
const W = 400
const H = 250
const START_ZONE: Pt[] = [[205, 95], [335, 110], [325, 215], [185, 200]]
const START_PERSON: Pt = [95, 190]
const BOX = { minX: 10, maxX: W - 10, minY: 60, maxY: H - 8 }
const clamp = (p: Pt) => clampPoint(p, BOX)
const FRAMES = 48

/** Preset trajectories, as a position for each fraction f of the clip (0 to 1). */
const PATHS = {
  through: { label: 'Walk through', at: (f: number): Pt => [30 + 350 * f, 175 - 10 * f + Math.sin(f * Math.PI) * 18] },
  past: { label: 'Walk past', at: (f: number): Pt => [30 + 350 * f, 236 - 4 * f] },
  stop: { label: 'Stop inside', at: (f: number): Pt => [30 + 235 * f, 150 + 15 * f] },
} as const
type PathKey = keyof typeof PATHS

type Event = { n: number; text: string }

export function ZoneTest() {
  const [zone, setZone] = useState<Pt[]>(START_ZONE)
  const [path, setPath] = useState<PathKey>('through')
  const [frame, setFrame] = useState(0)
  const [manual, setManual] = useState<Pt | null>(START_PERSON) // a hand-placed person overrides the path
  const [playing, setPlaying] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [showRule, setShowRule] = useState(true)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null) // -1 = person, 0..3 = zone corner
  const seq = useRef(0)
  const id = useId()

  const person = manual ?? clamp(PATHS[path].at(frame / FRAMES))
  const isIn = inside(person, zone)
  const crossings = rayCrossings(person, zone)
  const wasIn = useRef(isIn)

  // Log every change of state, like the tool's CSV log (simulated here).
  useEffect(() => {
    if (isIn !== wasIn.current) {
      const where = manual ? 'moved by hand' : `frame ${frame}`
      const text = isIn ? `${where} · entered the zone → clip, snapshot and CSV row would be saved` : `${where} · left the zone`
      setEvents(l => [{ n: ++seq.current, text }, ...l].slice(0, 4))
    }
    wasIn.current = isIn
  }, [isIn, frame, manual])

  // Playback: one frame per tick; with reduced motion, fewer and bigger steps.
  useEffect(() => {
    if (!playing) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setInterval(() => setFrame(f => Math.min(FRAMES, f + (reduce ? 6 : 1))), reduce ? 450 : 70)
    return () => window.clearInterval(t)
  }, [playing])
  useEffect(() => { if (frame >= FRAMES) setPlaying(false) }, [frame])

  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.current?.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return clamp([p.x, p.y])
  }
  const move = (k: number, p: Pt) => {
    if (k === -1) { setPlaying(false); setManual(p) } else setZone(z => z.map((q, i) => (i === k ? p : q)))
  }
  const onDown = (k: number) => (e: PointerEvent<SVGGElement>) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = k
  }
  const onMove = (e: PointerEvent<SVGSVGElement>) => { if (drag.current !== null) move(drag.current, toSvg(e)) }
  const onUp = () => { drag.current = null }
  const onKey = (k: number, cur: Pt) => (e: KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5
    const d = ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] } as Record<string, Pt>)[e.key]
    if (!d) return
    e.preventDefault()
    move(k, clamp([cur[0] + d[0], cur[1] + d[1]]))
  }

  const choosePath = (p: PathKey) => { setPath(p); setManual(null); setPlaying(false); setFrame(0) }
  const play = () => {
    if (manual) setManual(null)
    if (frame >= FRAMES) setFrame(0)
    setPlaying(p => !p)
  }
  const stepOnce = () => { setPlaying(false); setManual(null); setFrame(f => Math.min(FRAMES, f + 1)) }
  const reset = () => {
    setPlaying(false); setZone(START_ZONE); setPath('through'); setFrame(0); setManual(START_PERSON)
    setEvents([]); wasIn.current = inside(START_PERSON, START_ZONE)
  }

  const [px, py] = person
  const handle = 'cursor-grab outline-none active:cursor-grabbing [&:focus-visible>circle:first-child]:stroke-fg [&:focus-visible>circle:first-child]:stroke-[3]'
  const verdict = `${crossings.length} ${crossings.length === 1 ? 'edge' : 'edges'} crossed → ${crossings.length % 2 ? 'odd → inside' : 'even → outside'}`

  return (
    <div className="space-y-4">
      <Note label="Synthetic scene" tone="accent">
        No camera and no detector run here: the person’s box is drawn, not detected. The zone test is the same geometry AI Surveillance uses, computed live.
      </Note>
      <p id={`${id}-help`} className="text-sm leading-relaxed text-soft">
        Drag the corners to reshape the zone, drag the person, or play a path. Keyboard: Tab to a corner or the person and use the arrow keys (Shift for bigger steps).
      </p>

      {/* Wide screens: the scene and its frame slider on the left, controls and the rule on the right. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <div className="lab-out overflow-hidden">
            <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="group" aria-label="Zone check scene">
              <defs>
                <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0V20" fill="none" className="stroke-line" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={W} height={H} fill={`url(#${id}-grid)`} />
              <path d="M12 28V12H28M372 12H388V28M388 222V238H372M28 238H12V222" fill="none" className="stroke-mute" strokeWidth="1.5" />
              <text x="34" y="26" className="fill-mute font-mono text-[10px]">synthetic scene · frame {manual ? '—' : frame}</text>

              <polygon points={zone.map(p => p.join(',')).join(' ')} className={cn('transition-colors', isIn ? 'fill-accent/25 stroke-accent' : 'fill-accent/10 stroke-accent/70')} strokeWidth="2" strokeDasharray={isIn ? undefined : '6 5'} />

              {/* the trajectory, when a preset is in use */}
              {!manual && (
                <polyline points={Array.from({ length: FRAMES + 1 }, (_, i) => clamp(PATHS[path].at(i / FRAMES)).join(',')).join(' ')} fill="none" className="stroke-mute" strokeWidth="1" strokeDasharray="2 4" />
              )}

              {/* the rule: a ray from the feet point to the right, and where it crosses the zone's edges */}
              {showRule && (
                <g aria-hidden="true">
                  <line x1={px} y1={py} x2={W - 10} y2={py} className="stroke-fg" strokeWidth="1" strokeDasharray="4 3" />
                  {crossings.map(x => <circle key={x} cx={x} cy={py} r="4" className="fill-bg stroke-fg" strokeWidth="1.5" />)}
                </g>
              )}

              {/* the person: a box (drawn here, from a detector in the real tool) and the feet point that's tested */}
              <g role="button" tabIndex={0} aria-label={`Person, feet at ${Math.round(px)}, ${Math.round(py)}. ${isIn ? 'Inside the zone.' : 'Outside the zone.'}`} aria-describedby={`${id}-help`} onPointerDown={onDown(-1)} onKeyDown={onKey(-1, person)} className={handle}>
                <circle cx={px} cy={py - 30} r="34" fill="transparent" />
                <rect x={px - 17} y={py - 64} width="34" height="64" rx="3" fill="none" className={isIn ? 'stroke-accent' : 'stroke-mute'} strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx={px} cy={py - 52} r="7" className="fill-soft" />
                <rect x={px - 8} y={py - 43} width="16" height="40" rx="7" className="fill-soft" />
                <circle cx={px} cy={py} r="4.5" className={isIn ? 'fill-accent' : 'fill-fg'} />
              </g>

              {zone.map(([x, y], i) => (
                <g key={i} role="button" tabIndex={0} aria-label={`Zone corner ${i + 1} of 4, at ${x}, ${y}`} aria-describedby={`${id}-help`} onPointerDown={onDown(i)} onKeyDown={onKey(i, [x, y])} className={handle}>
                  <circle cx={x} cy={y} r="7" className="fill-bg stroke-accent" strokeWidth="2" />
                  <circle cx={x} cy={y} r="16" fill="transparent" />
                </g>
              ))}
            </svg>
          </div>
          <label className="block">
            <span className="lab-label">Frame {manual ? '(moved by hand)' : `${frame} of ${FRAMES}`}</span>
            <input type="range" min={0} max={FRAMES} value={manual ? 0 : frame} onChange={e => { setPlaying(false); setManual(null); setFrame(Number(e.target.value)) }} className="mt-1 block w-full accent-[var(--color-accent)]" aria-valuetext={manual ? 'moved by hand' : `frame ${frame} of ${FRAMES}`} />
          </label>
        </div>

        <div className="space-y-4">
          {/* trajectory controls */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <ChipChoice name={`${id}-path`} legend="Path" options={Object.keys(PATHS) as PathKey[]} value={path} onChange={choosePath} labels={k => PATHS[k].label} />
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={play} aria-pressed={playing}>{playing ? 'Pause' : frame >= FRAMES && !manual ? 'Replay' : 'Play'}</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={stepOnce} disabled={!manual && frame >= FRAMES}>Step</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
            </div>
          </div>
          {/* the rule, step by step, and the result */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
            <div className="lab-out space-y-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="lab-label">How the rule decides</p>
                <label className="flex items-center gap-1.5 text-xs text-soft">
                  <input type="checkbox" checked={showRule} onChange={e => setShowRule(e.target.checked)} className="accent-[var(--color-accent)]" /> show ray
                </label>
              </div>
              <ol className="space-y-1 text-xs leading-relaxed text-soft">
                <li><span className="font-mono text-accent">1</span> Box around the person (the real tool gets it from YOLOv8).</li>
                <li><span className="font-mono text-accent">2</span> Feet point = bottom-centre of the box: <span className="font-mono text-fg">({Math.round(px)}, {Math.round(py)})</span>.</li>
                <li><span className="font-mono text-accent">3</span> Cast a ray to the right and count the zone edges it crosses: <span className="font-mono text-fg">{verdict}</span>.</li>
                <li><span className="font-mono text-accent">4</span> Crossing from outside to inside is an intrusion.</li>
              </ol>
            </div>
            <div className="lab-out space-y-2 p-3">
              <p aria-live="polite" className={cn('chip inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-xs', isIn ? 'border-accent bg-accent text-accent-ink' : 'border-line text-soft')}>
                <span aria-hidden="true" className={cn('size-1.5 rounded-full', isIn ? 'bg-accent-ink' : 'bg-live')} />
                {isIn ? 'Inside the zone: intrusion' : 'Outside the zone: clear'}
              </p>
              <p className="lab-label">Event log (simulated)</p>
              {events.length === 0
                ? <p className="text-xs text-mute">No events yet. Play a path or move the person into the zone.</p>
                : <ul className="space-y-1 font-mono text-[0.6875rem] leading-relaxed text-soft">{events.map(e => <li key={e.n}>{e.text}</li>)}</ul>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
