/** Plane geometry for the Lab's zone check (see components/ZoneTest.tsx). Pure, so it's unit-tested. */
export type Pt = [number, number]

/** Ray casting: count how many polygon edges a horizontal ray from the point crosses. */
export function inside([x, y]: Pt, poly: readonly Pt[]) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/** Keep a point inside a box and on whole units. */
export function clampPoint([x, y]: Pt, box: { minX: number; maxX: number; minY: number; maxY: number }): Pt {
  return [Math.round(Math.min(box.maxX, Math.max(box.minX, x))), Math.round(Math.min(box.maxY, Math.max(box.minY, y)))]
}
