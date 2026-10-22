import { describe, expect, it } from 'vitest'
import { DEFAULTS, OPTIONS, parsePrefs } from '../../app/src/lib/prefs'

describe('parsePrefs', () => {
  it('returns the defaults when nothing is stored', () => {
    expect(parsePrefs(null, null)).toEqual(DEFAULTS)
    expect(parsePrefs('', null)).toEqual(DEFAULTS)
  })

  it('defaults are themselves valid options', () => {
    for (const k of Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]) expect(OPTIONS[k]).toContain(DEFAULTS[k])
  })

  it('keeps every valid stored value', () => {
    const all = { theme: 'light', text: 'lg', accent: 'moss', density: 'airy', radius: 'none' }
    expect(parsePrefs(JSON.stringify(all), null)).toEqual(all)
  })

  it('drops unknown values and unknown keys, key by key', () => {
    const p = parsePrefs(JSON.stringify({ theme: 'sepia', accent: 'rose', text: 3, extra: 'x' }), null)
    expect(p).toEqual({ ...DEFAULTS, accent: 'rose' })
    expect(p).not.toHaveProperty('extra')
  })

  it('ignores a heading-font choice saved by an earlier version: headings are always Bricolage', () => {
    expect(OPTIONS).not.toHaveProperty('type')
    expect(parsePrefs('{"type":"mono","accent":"moss"}', null)).toEqual({ ...DEFAULTS, accent: 'moss' })
  })

  it('falls back to the defaults on corrupt or non-object JSON', () => {
    for (const raw of ['{oops', 'null', '5', '"dark"', '[]']) expect(parsePrefs(raw, null)).toEqual(DEFAULTS)
  })

  it("honours the previous site's lone 'theme' key when prefs has no theme", () => {
    expect(parsePrefs(null, 'light').theme).toBe('light')
    expect(parsePrefs('{"accent":"ember"}', 'light')).toEqual({ ...DEFAULTS, theme: 'light', accent: 'ember' })
  })

  it('prefers the theme in prefs over the legacy key, and ignores an invalid legacy value', () => {
    expect(parsePrefs('{"theme":"dark"}', 'light').theme).toBe('dark')
    expect(parsePrefs(null, 'blue').theme).toBe(DEFAULTS.theme)
  })
})
