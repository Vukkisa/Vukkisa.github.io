import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '../lib/utils'

/**
 * The zone check from AI Surveillance, re-created in the browser: a person's feet point (the
 * bottom-centre of their box) is tested against a polygon you draw. Only the geometry is real here.
 * There's no camera, no detector and nothing is recorded; the log is simulated.
 */
type Pt = [number, number]
const W = 400
const H = 250
const START_ZONE: Pt[] = [[205, 95], [335, 110], [325, 215], [185, 200]]
const START_PERSON: Pt = [95, 190]

/** Ray casting: count how many polygon edges a horizontal ray from the point crosses. */
function inside([x, y]: Pt, poly: Pt[]) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

const clamp = ([x, y]: Pt): Pt => [Math.round(Math.min(W - 10, Math.max(10, x))), Math.round(Math.min(H - 8, Math.max(60, y)))]

export function ZoneTest() {
  const [zone, setZone] = useState<Pt[]>(START_ZONE)
  const [person, setPerson] = useState<Pt>(START_PERSON)
  const [log, setLog] = useState<string[]>([])
  const [walking, setWalking] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null)   // -1 = person, 0..3 = zone corner
  const raf = useRef(0)
  const id = useId()
  const alert = inside(person, zone)
  const wasIn = useRef(alert)

  // A new entry each time the feet point crosses into the zone, like the tool's CSV log.
  useEffect(() => {
    if (alert && !wasIn.current) {
      const t = new Date()
      setLog(l => [`${t.toLocaleTimeString([], { hour12: false })}  intrusion  feet=(${person[0]}, ${person[1]})`, ...l].slice(0, 3))
    }
    wasIn.current = alert
  }, [alert, person])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.current?.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return clamp([p.x, p.y])
  }
  const move = (k: number, p: Pt) => (k === -1 ? setPerson(p) : setZone(z => z.map((q, i) => (i === k ? p : q))))

  const onDown = (k: number) => (e: PointerEvent<SVGGElement>) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = k
    cancelAnimationFrame(raf.current); setWalking(false)
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

  const walk = () => {
    cancelAnimationFrame(raf.current)
    const from: Pt = [30, 175]
    const to: Pt = [380, 165]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = 3200
    const t0 = performance.now()
    setWalking(true)
    const tick = (now: number) => {
      let f = Math.min(1, (now - t0) / dur)
      if (reduce && f < 1) f = Math.floor(f * 6) / 6   // a few discrete steps instead of gliding
      setPerson(clamp([from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f + Math.sin(f * Math.PI) * 18]))
      if (f < 1) raf.current = requestAnimationFrame(tick)
      else setWalking(false)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const reset = () => { cancelAnimationFrame(raf.current); setWalking(false); setZone(START_ZONE); setPerson(START_PERSON); setLog([]) }

  const [px, py] = person
  const handle = 'cursor-grab outline-none active:cursor-grabbing [&:focus-visible>circle:first-child]:stroke-fg [&:focus-visible>circle:first-child]:stroke-[3]'
  return (
    <div>
      <p id={`${id}-help`} className="text-sm leading-relaxed text-soft">
        Drag the corners to draw a restricted zone, then move the person or press <em>Walk through</em>. Keyboard: Tab to a corner or the person, then use the arrow keys (Shift for bigger steps).
      </p>

      <div className="mt-4 overflow-hidden rounded-(--r-sm) border border-line bg-bg">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full touch-none select-none"
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="group"
          aria-label="Zone check canvas"
        >
          <defs>
            <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" className="stroke-line" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill={`url(#${id}-grid)`} />
          {/* viewfinder corners */}
          <path d="M12 28V12H28M372 12H388V28M388 222V238H372M28 238H12V222" fill="none" className="stroke-mute" strokeWidth="1.5" />
          <text x="34" y="26" className="fill-mute font-mono text-[10px]">CAM 01 · simulated</text>

          <polygon points={zone.map(p => p.join(',')).join(' ')} className={cn('transition-colors', alert ? 'fill-accent/25 stroke-accent' : 'fill-accent/10 stroke-accent/70')} strokeWidth="2" strokeDasharray={alert ? undefined : '6 5'} />

          {/* the person: a box from the detector, and the feet point that's actually tested */}
          <g
            role="button"
            tabIndex={0}
            aria-label={`Person, feet at ${px}, ${py}. ${alert ? 'Inside the zone.' : 'Outside the zone.'}`}
            aria-describedby={`${id}-help`}
            onPointerDown={onDown(-1)}
            onKeyDown={onKey(-1, person)}
            className={handle}
          >
            <circle cx={px} cy={py - 30} r="34" fill="transparent" />
            <rect x={px - 17} y={py - 64} width="34" height="64" rx="3" fill="none" className={alert ? 'stroke-accent' : 'stroke-mute'} strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx={px} cy={py - 52} r="7" className="fill-soft" />
            <rect x={px - 8} y={py - 43} width="16" height="40" rx="7" className="fill-soft" />
            <circle cx={px} cy={py} r="4.5" className={alert ? 'fill-accent' : 'fill-fg'} />
          </g>

          {zone.map(([x, y], i) => (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Zone corner ${i + 1} of 4, at ${x}, ${y}`}
              aria-describedby={`${id}-help`}
              onPointerDown={onDown(i)}
              onKeyDown={onKey(i, [x, y])}
              className={handle}
            >
              <circle cx={x} cy={y} r="7" className="fill-bg stroke-accent" strokeWidth="2" />
              <circle cx={x} cy={y} r="16" fill="transparent" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={cn('chip inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-xs', alert ? 'border-accent bg-accent text-accent-ink' : 'border-line text-soft')}>
          <span aria-hidden="true" className={cn('size-1.5 rounded-full', alert ? 'bg-accent-ink' : 'bg-live')} />
          {alert ? 'Feet point inside the zone: intrusion' : 'Feet point outside the zone: clear'}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={walk} disabled={walking} className="chip border border-line-strong px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent disabled:opacity-50">▶ Walk through</button>
          <button type="button" onClick={reset} className="chip border border-line px-3 py-1 text-xs text-soft transition-colors hover:text-fg">Reset</button>
        </div>
      </div>

      <div className="mt-3 rounded-(--r-sm) bg-chip px-3 py-2 font-mono text-[11px] leading-relaxed text-mute">
        <p>simulated log · in the real tool each intrusion saves a clip, a snapshot and a CSV row</p>
        {log.length === 0 ? <p>—</p> : log.map((l, i) => <p key={log.length - i} className="text-soft">{l}</p>)}
      </div>
    </div>
  )
}
