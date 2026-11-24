/**
 * One shared "hand" for the site: the hero line, the portrait frame and the project-card
 * outlines are all drawn with these helpers, so they share a stroke weight, a way of wobbling
 * and (in proto.css) one easing curve and draw timing.
 */
export type Pt = readonly [number, number]

/** Small seeded random generator so each outline is stable between renders. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => Math.round(n * 10) / 10

/** Smooth open curve through the points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(p: Pt[]): string {
  if (p.length < 2) return ''
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/**
 * A rectangle sketched by hand: it starts near the top-left, runs clockwise with gently bowed
 * sides and soft corners, and overshoots its start by a few pixels like a pen that did not quite
 * stop. `pad` keeps the stroke clear of the content so it never covers it.
 */
export function sketchRect(w: number, h: number, seed: number, pad = 7, wobble = 1.5, rad = 16): string {
  const r = rng(seed)
  const j = () => (r() - 0.5) * 2 * wobble
  const x0 = pad, y0 = pad, x1 = w - pad, y1 = h - pad
  const pts: Pt[] = []
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay)
    const n = Math.max(2, Math.round(len / 90))
    for (let i = 1; i < n; i++) {
      const t = i / n
      // a slow bow across the side plus a little noise, so it reads as one confident stroke
      const bow = Math.sin(t * Math.PI) * 1.4 * (r() > 0.5 ? 1 : -1)
      const nx = (by - ay) / len, ny = -(bx - ax) / len
      pts.push([ax + (bx - ax) * t + nx * (bow + j() * 0.6), ay + (by - ay) * t + ny * (bow + j() * 0.6)])
    }
  }
  const corner = (cx: number, cy: number, a0: number) => {
    for (let k = 0; k < 3; k++) {
      const a = a0 + (k * Math.PI) / 4 + Math.PI / 8
      pts.push([cx + Math.cos(a) * (rad + j() * 0.5), cy + Math.sin(a) * (rad + j() * 0.5)])
    }
  }
  const start: Pt = [x0 + rad * 0.9 + j(), y0 + j() * 0.5]
  pts.push(start)
  side(x0 + rad, y0, x1 - rad, y0)
  corner(x1 - rad, y0 + rad, -Math.PI / 2)
  side(x1, y0 + rad, x1, y1 - rad)
  corner(x1 - rad, y1 - rad, 0)
  side(x1 - rad, y1, x0 + rad, y1)
  corner(x0 + rad, y1 - rad, Math.PI / 2)
  side(x0, y1 - rad, x0, y0 + rad)
  corner(x0 + rad, y0 + rad, Math.PI)
  // overshoot: pass the start and carry on along the top edge, slightly outside it
  pts.push([start[0] + 14, y0 - 1.6 + j() * 0.4], [start[0] + 34, y0 - 2.2 + j() * 0.4])
  return smoothPath(pts)
}

/**
 * The route of the hero line: waypoints are nudged sideways by a seeded amount and a softly
 * offset mid-point is added between each pair, so the curve meanders instead of tracing perfect arcs.
 */
export function organicRoute(way: Pt[], seed: number, amp: number): Pt[] {
  const r = rng(seed)
  const out: Pt[] = [way[0]]
  for (let i = 1; i < way.length; i++) {
    const [ax, ay] = way[i - 1], [bx, by] = way[i]
    const dy = by - ay
    if (Math.abs(dy) > 160) out.push([(ax + bx) / 2 + (r() - 0.5) * amp, ay + dy * (0.42 + r() * 0.16)])
    out.push([bx + (i === way.length - 1 ? 0 : (r() - 0.5) * amp * 0.5), by])
  }
  return out
}

/** A small hand-drawn ring (used for the Journey's chapter dots). Starts at the top, overshoots a little. */
export function sketchRing(size: number, seed: number): string {
  const r = rng(seed), c = size / 2, rad = size / 2 - 2
  const pts: Pt[] = []
  for (let k = 0; k <= 9; k++) {
    const a = -Math.PI / 2 + (k / 8) * Math.PI * 2 + 0.12
    const rr = rad + (r() - 0.5) * 1.2 + (k > 8 ? 1.4 : 0)
    pts.push([c + Math.cos(a) * rr, c + Math.sin(a) * rr])
  }
  return smoothPath(pts)
}
