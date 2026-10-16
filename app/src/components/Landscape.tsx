import { memo, type ReactNode } from 'react'

/**
 * The journey illustration: Data → Processing → Learning → Retrieval → Applications, as one
 * isometric landscape joined by a single thread. `stage` (0–5) is how far the thread has run;
 * each station lights up when the thread reaches it. A metaphor for the path, not a system diagram.
 *
 * Geometry is fixed (seeded), so React only toggles classes between renders and CSS animates the
 * colours and the thread. Colours come from CSS variables (index.css, `.scape`), so it follows the
 * theme and the accent token.
 */

const S = 32
const OX = 440
const OY = 300
const C30 = Math.cos(Math.PI / 6)
const iso = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * C30 * S, OY + (x + y) * 0.5 * S - z * S]
const pts = (...p: [number, number, number][]) => p.map(q => iso(...q).map(n => n.toFixed(1)).join(',')).join(' ')

type Tone = 'plain' | 'soft' | 'acc' | 'ghost'
function Box({ x, y, z, w, d, h, tone = 'plain' }: { x: number; y: number; z: number; w: number; d: number; h: number; tone?: Tone }) {
  return (
    <g className={`bx ${tone}`}>
      <polygon className="l" points={pts([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h])} />
      <polygon className="r" points={pts([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h])} />
      <polygon className="t" points={pts([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h])} />
    </g>
  )
}
const Shadow = ({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) => {
  const k = 0.45 * h
  return <polygon className="shadow" points={pts([x, y + d, 0], [x + w, y + d, 0], [x + w + k, y + d - k * 0.3, 0], [x + w + k, y - k * 0.3, 0], [x + w, y, 0])} />
}

// A small seeded PRNG so the data scatter is the same on every visit (and on server and client).
function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
}

const PATH: [number, number][] = [[-3, 2], [3, 2], [8.5, 2], [14, 2.2], [20.5, 2], [26, 2], [28.2, 2]]
const SEG = PATH.slice(1).map((b, i) => Math.hypot(b[0] - PATH[i][0], b[1] - PATH[i][1]))
const TOTAL = SEG.reduce((a, b) => a + b, 0)
/** How far along the thread (0–1) each stage reaches: just past each station. */
const STOPS = [0.03, 0.17, 0.45, 0.62, 0.78, 1]

function pointAt(f: number): [number, number] {
  let left = f * TOTAL
  for (let i = 0; i < SEG.length; i++) {
    if (left <= SEG[i]) {
      const [a, b] = [PATH[i], PATH[i + 1]]
      const t = left / SEG[i]
      return iso(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
    }
    left -= SEG[i]
  }
  return iso(...PATH[PATH.length - 1])
}

type Item = { depth: number; node: ReactNode }

function scene(stage: number) {
  const items: Item[] = []
  let n = 0
  const add = (x: number, y: number, w: number, d: number, node: ReactNode) => items.push({ depth: x + y + (w + d) / 2, node: <g key={n++}>{node}</g> })

  // 1. Data: an irregular scatter of uneven blocks, a couple still drifting into place.
  const rnd = rng(5)
  const taken: [number, number][] = []
  let guard = 0
  while (taken.length < 20 && guard++ < 2000) {
    const x = -3.2 + rnd() * 5
    const y = -1.2 + rnd() * 5.6
    if (taken.some(([a, b]) => Math.abs(x - a) < 0.95 && Math.abs(y - b) < 0.95)) continue
    taken.push([x, y])
    const w = 0.7 + rnd() * 0.2
    const h = 0.25 + rnd() ** 1.6 * 1.3
    const lit = stage >= 1 && taken.length % 7 === 3
    add(x, y, w, w, <><Shadow x={x} y={y} w={w} d={w} h={h} /><Box x={x} y={y} z={0} w={w} d={w} h={h} tone={lit ? 'soft' : 'plain'} /></>)
  }
  for (const [x, y] of [[-1.6, -2.6], [1.4, -2.4]] as const) {
    add(x, y, 0.7, 0.7, <><Box x={x} y={y} z={1.1} w={0.7} d={0.7} h={0.5} tone="ghost" /><Box x={x + 0.2} y={y + 0.2} z={0.35} w={0.7} d={0.7} h={0.5} /></>)
  }

  // 2. Processing: a gate across the thread; after it, the same data in tidy rows.
  const gx = 6.2
  for (const py of [-0.4, 3.8]) add(gx, py, 0.6, 0.6, <><Shadow x={gx} y={py} w={0.6} d={0.6} h={3.2} /><Box x={gx} y={py} z={0} w={0.6} d={0.6} h={3.2} /></>)
  add(gx, -0.4, 0.6, 4.8, <Box x={gx} y={-0.4} z={3.2} w={0.6} d={4.8} h={0.45} tone={stage >= 2 ? 'soft' : 'plain'} />)
  for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 3; k++) {
      const x = 7.9 + k * 1.05
      const y = 0.1 + r * 1.05
      add(x, y, 0.8, 0.8, <Box x={x} y={y} z={0} w={0.8} d={0.8} h={0.55} tone={stage >= 2 && r === 1 ? 'soft' : 'plain'} />)
    }
  }

  // 3. Learning: a floating stack of thin layers joined by vertical connections.
  const lx = 13.2
  const ly = -0.6
  for (let i = 0; i < 4; i++) {
    const inset = i * 0.35
    const sz = 4.2 - inset * 2
    add(lx + inset, ly + inset, sz, sz, <Box x={lx + inset} y={ly + inset} z={0.5 + i * 1.05} w={sz} d={sz} h={0.14} tone={stage >= 3 && i === 3 ? 'acc' : stage >= 3 ? 'soft' : 'plain'} />)
  }
  for (const [cx, cy] of [[lx + 1.2, ly + 1.2], [lx + 3, ly + 1.2], [lx + 1.2, ly + 3], [lx + 3, ly + 3], [lx + 2.1, ly + 2.1]]) {
    const [x1, y1] = iso(cx, cy, 0.64)
    const [x2, y2] = iso(cx, cy, 3.65)
    add(cx, cy, 0.01, 0.01, <line className="wire" x1={x1} y1={y1} x2={x2} y2={y2} />)
  }
  add(lx, ly, 4.2, 4.2, <Shadow x={lx} y={ly} w={4.2} d={4.2} h={1.2} />)

  // 4. Retrieval: an archive of drawers; one slides out toward the thread.
  const [rx, ry, rw, rd, rh] = [19.4, -1.4, 2.6, 2.6, 4.4]
  add(rx, ry, rw, rd, (
    <>
      <Shadow x={rx} y={ry} w={rw} d={rd} h={rh} />
      <Box x={rx} y={ry} z={0} w={rw} d={rd} h={rh} />
      {[1, 2, 3, 4].map(k => {
        const [x1, y1] = iso(rx, ry + rd, (rh * k) / 5)
        const [x2, y2] = iso(rx + rw, ry + rd, (rh * k) / 5)
        return <line key={k} className="wire" x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
    </>
  ))
  const pulled = stage >= 4
  add(rx + 0.5, ry + rd, 1.6, 1.6, (
    <>
      <g className="fade" style={{ opacity: pulled ? 0 : 1 }}><Box x={rx + 0.5} y={ry + rd - 0.2} z={(rh * 2) / 5 + 0.05} w={1.6} d={0.3} h={rh / 5 - 0.1} /></g>
      <g className="fade" style={{ opacity: pulled ? 1 : 0 }}><Box x={rx + 0.5} y={ry + rd - 0.2} z={(rh * 2) / 5 + 0.05} w={1.6} d={1.6} h={rh / 5 - 0.1} tone="acc" /></g>
    </>
  ))

  // 5. Applications, the focal point: a tall monolith with small modules docked around it.
  const [mx, my] = [27.6, 0.2]
  const focal = stage >= 5
  add(mx, my, 1.5, 1.5, <><Shadow x={mx} y={my} w={1.5} d={1.5} h={6.4} /><Box x={mx} y={my} z={0} w={1.5} d={1.5} h={6.4} tone={focal ? 'acc' : 'plain'} /></>)
  for (const [x, y, w, h] of [[25, 1.4, 0.9, 0.7], [27.8, 2.6, 1, 1.2], [30, 0.6, 1.1, 0.9]]) {
    add(x, y, w, w, <><Shadow x={x} y={y} w={w} d={w} h={h} /><Box x={x} y={y} z={0} w={w} d={w} h={h} tone={focal ? 'soft' : 'plain'} /></>)
    const [ax, ay] = iso(x + w / 2, y + w / 2, h)
    const [bx, by] = iso(mx + 0.75, my + 0.75, Math.min(h + 0.6, 2.6))
    add(x + 0.1, y + 0.1, w, w, <line className={`link-line ${focal ? 'on' : ''}`} x1={ax} y1={ay} x2={bx} y2={by} strokeWidth={1.4} />)
  }

  return items.sort((a, b) => a.depth - b.depth).map(i => i.node)
}

const GROUND = (() => {
  const [x0, y0, x1, y1] = [-4, -2, 34, 6]
  const lines: ReactNode[] = []
  for (let gx = x0 + 2; gx < x1; gx += 2) { const [a, b] = iso(gx, y0); const [c, d] = iso(gx, y1); lines.push(<line key={`x${gx}`} className="grid" x1={a} y1={b} x2={c} y2={d} />) }
  for (let gy = y0 + 2; gy < y1; gy += 2) { const [a, b] = iso(x0, gy); const [c, d] = iso(x1, gy); lines.push(<line key={`y${gy}`} className="grid" x1={a} y1={b} x2={c} y2={d} />) }
  return (
    <g>
      <polygon className="ground" points={pts([x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0])} />
      <polygon className="ground-l" points={pts([x0, y1, 0], [x1, y1, 0], [x1, y1, -0.6], [x0, y1, -0.6])} />
      <polygon className="ground-r" points={pts([x1, y0, 0], [x1, y1, 0], [x1, y1, -0.6], [x1, y0, -0.6])} />
      {lines}
    </g>
  )
})()

const THREAD_D = 'M' + PATH.map(p => iso(...p).map(n => n.toFixed(1)).join(',')).join(' L')

export const Landscape = memo(function Landscape({ stage }: { stage: number }) {
  const f = STOPS[Math.max(0, Math.min(5, stage))]
  const [hx, hy] = pointAt(f)
  return (
    <svg viewBox="150 160 1310 820" className="scape h-auto w-full" aria-hidden="true" focusable="false">
      {GROUND}
      <path d={THREAD_D} className="thread-base" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="2 7" />
      <path d={THREAD_D} className="thread" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - f} />
      {scene(stage)}
      <g className="head" style={{ transform: `translate(${hx}px, ${hy}px)` }}>
        <circle r={6} />
        {f < 1 && <circle className="head-ring" r={13} fill="none" strokeWidth={1.5} />}
      </g>
    </svg>
  )
})
