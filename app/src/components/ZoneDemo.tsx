import { m, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { cn } from '../lib/utils'

const ZONES = [
  { x: 268, y: 58, w: 176, h: 186 },
  { x: 52, y: 78, w: 150, h: 166 },
]
const BOX = { y: 112, w: 44, h: 118 }

/**
 * A drawn stand-in for the camera view: a person walks across, a zone you can move, and the
 * intersection test that turns "seen" into "event". Simulated, not real inference.
 */
export function ZoneDemo() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref)
  const reduce = useReducedMotion()
  const [zone, setZone] = useState(0)
  const [inside, setInside] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const x = useMotionValue(reduce ? 300 : 40)
  const insideRef = useRef(false)
  const start = useRef<number | null>(null)

  useAnimationFrame(t => {
    if (!inView || reduce) return
    if (start.current === null) start.current = t
    const px = 30 + ((Math.sin(t / 1900) + 1) / 2) * 400
    x.set(px)
    const z = ZONES[zone]
    const overlap = Math.max(0, Math.min(px + BOX.w, z.x + z.w) - Math.max(px, z.x)) * Math.max(0, Math.min(BOX.y + BOX.h, z.y + z.h) - Math.max(BOX.y, z.y))
    const now = overlap / (BOX.w * BOX.h) > 0.5
    if (now !== insideRef.current) {
      insideRef.current = now
      setInside(now)
      if (now) setEvents(e => [`t+${((t - (start.current ?? t)) / 1000).toFixed(1)}s  person entered zone → frame captured`, ...e].slice(0, 3))
    }
  })

  const z = ZONES[zone]
  const hot = reduce ? true : inside
  return (
    <figure className="overflow-hidden rounded-xl border border-rule bg-panel/70">
      <svg ref={ref} viewBox="0 0 480 270" className="block w-full bg-[#0a0b09]" role="img" aria-label="Simulated camera view: a person walks across the frame; when their box overlaps the restricted zone, an event fires.">
        {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1="0" x2="480" y1={30 * i + 15} y2={30 * i + 15} stroke="#1c1d18" />)}
        {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} y1="0" y2="270" x1={30 * i + 15} x2={30 * i + 15} stroke="#1c1d18" />)}
        <m.rect
          initial={false}
          animate={{ x: z.x, y: z.y, width: z.w, height: z.h }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          fill={hot ? 'rgb(255 178 36 / 0.14)' : 'rgb(255 178 36 / 0.05)'}
          stroke="#ffb224" strokeDasharray="6 5" strokeWidth={1.5}
        />
        <m.text initial={false} animate={{ x: z.x + 8, y: z.y + 18 }} className="font-mono" fontSize="10" fill="#ffb224">RESTRICTED ZONE</m.text>
        <m.g style={{ x }}>
          <circle cx={BOX.w / 2} cy={BOX.y + 18} r={10} fill={hot ? '#ffb224' : '#8fe0a4'} opacity="0.25" />
          <rect x={BOX.w / 2 - 12} y={BOX.y + 32} width={24} height={70} rx={6} fill={hot ? '#ffb224' : '#8fe0a4'} opacity="0.2" />
          <rect x={0} y={BOX.y} width={BOX.w} height={BOX.h} fill="none" stroke={hot ? '#ffb224' : '#8fe0a4'} strokeWidth={hot ? 2.5 : 1.5} />
          <rect x={0} y={BOX.y - 16} width={hot ? 58 : 46} height={15} fill={hot ? '#ffb224' : '#8fe0a4'} />
          <text x={4} y={BOX.y - 5} className="font-mono" fontSize="9.5" fill="#0d0e0c">{hot ? 'EVENT' : 'person'}</text>
        </m.g>
        <text x="12" y="20" className="font-mono" fontSize="10" fill="#8f8d81">SIMULATED FEED · not real inference</text>
        <text x="468" y="20" textAnchor="end" className="font-mono" fontSize="10" fill={hot ? '#ffb224' : '#57564d'}>● {hot ? 'ALERT' : 'WATCHING'}</text>
      </svg>
      <figcaption className="flex flex-col gap-4 border-t border-rule px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <ol className="min-h-[3.6rem] space-y-1 font-mono text-[11px] text-soft" aria-label="Event log">
          {events.length === 0 && <li className="text-dim">event log · waiting for someone to walk in</li>}
          {events.map((e, i) => <li key={e} className={cn(i === 0 ? 'text-amber' : 'text-mute')}>{e}</li>)}
        </ol>
        <button
          type="button"
          onClick={() => setZone(v => (v + 1) % ZONES.length)}
          className="shrink-0 self-start rounded-full border border-rule px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fg transition-colors hover:border-amber hover:text-amber"
        >
          Redraw the zone
        </button>
      </figcaption>
    </figure>
  )
}
