import { describe, expect, it } from 'vitest'
import { clampPoint, inside, type Pt } from '../../app/src/lib/geometry'

const square: Pt[] = [[0, 0], [10, 0], [10, 10], [0, 10]]
// An L shape: the notch at the top right is outside.
const ell: Pt[] = [[0, 0], [5, 0], [5, 5], [10, 5], [10, 10], [0, 10]]

describe('inside (point in polygon)', () => {
  it('finds points inside and outside a square', () => {
    expect(inside([5, 5], square)).toBe(true)
    expect(inside([-1, 5], square)).toBe(false)
    expect(inside([5, 11], square)).toBe(false)
    expect(inside([11, 11], square)).toBe(false)
  })

  it('handles a concave polygon', () => {
    expect(inside([2, 2], ell)).toBe(true)
    expect(inside([8, 8], ell)).toBe(true)
    expect(inside([8, 2], ell)).toBe(false) // in the notch
  })

  it('does not depend on the winding direction', () => {
    const reversed = [...ell].reverse()
    for (const p of [[2, 2], [8, 8], [8, 2], [-3, 4]] as Pt[]) expect(inside(p, reversed)).toBe(inside(p, ell))
  })

  it('treats a degenerate polygon as empty', () => {
    expect(inside([1, 1], [])).toBe(false)
    expect(inside([1, 1], [[0, 0], [2, 2]])).toBe(false)
  })

  it('matches the Lab zone check: the person starts outside, and the walk path crosses the zone', () => {
    const zone: Pt[] = [[205, 95], [335, 110], [325, 215], [185, 200]]
    expect(inside([95, 190], zone)).toBe(false)
    const path = Array.from({ length: 61 }, (_, i) => {
      const f = i / 60
      return [30 + 350 * f, 175 - 10 * f + Math.sin(f * Math.PI) * 18] as Pt
    })
    expect(path.some(p => inside(p, zone))).toBe(true)
    expect(inside(path[0], zone) || inside(path[60], zone)).toBe(false)
  })
})

describe('clampPoint', () => {
  const box = { minX: 10, maxX: 390, minY: 60, maxY: 242 }
  it('keeps points inside the box', () => {
    expect(clampPoint([0, 0], box)).toEqual([10, 60])
    expect(clampPoint([999, 999], box)).toEqual([390, 242])
  })
  it('rounds to whole units and leaves inner points alone', () => {
    expect(clampPoint([100.4, 150.6], box)).toEqual([100, 151])
  })
})
