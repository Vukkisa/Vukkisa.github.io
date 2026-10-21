/**
 * Drift guard for the inline "pre-paint" script in app/index.html. That script applies saved
 * preferences before the app loads (so nothing flashes), which means it duplicates the logic in
 * app/src/lib/prefs.ts. Here it is run in a sandbox against many stored values and must give
 * exactly the same answer as parsePrefs(). The deployed copy in the root index.html must match too.
 */
import { existsSync, readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { DEFAULTS, OPTIONS, parsePrefs } from '../../app/src/lib/prefs'

const MARKER = "localStorage.getItem('prefs')"

function prePaintScript(file: string) {
  const html = readFileSync(file, 'utf8')
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.includes(MARKER))
  expect(scripts, `${file} should contain exactly one pre-paint script`).toHaveLength(1)
  return scripts[0]
}

/** Run the script with a fake document and storage; return what it wrote to <html data-*>. */
function runScript(src: string, store: { prefs?: string | null; theme?: string | null; throws?: boolean }) {
  const dataset: Record<string, string> = {}
  const meta = { content: '' }
  const localStorage = {
    getItem(k: string) {
      if (store.throws) throw new Error('SecurityError: storage blocked')
      return (k === 'prefs' ? store.prefs : k === 'theme' ? store.theme : null) ?? null
    },
  }
  const document = { documentElement: { dataset }, querySelector: (s: string) => (s.includes('theme-color') ? meta : null) }
  runInNewContext(src, { document, localStorage, JSON })
  return { dataset, themeColor: meta.content }
}

const CASES: { name: string; prefs?: string | null; theme?: string | null; throws?: boolean }[] = [
  { name: 'nothing stored' },
  { name: 'all valid', prefs: JSON.stringify({ theme: 'light', text: 'lg', accent: 'moss', type: 'mono', density: 'airy', radius: 'none' }) },
  { name: 'mixed valid and invalid', prefs: JSON.stringify({ theme: 'sepia', accent: 'rose', density: 'compact', radius: 7 }) },
  { name: 'legacy theme only', theme: 'light' },
  { name: 'legacy theme plus prefs without theme', prefs: '{"accent":"ember"}', theme: 'light' },
  { name: 'prefs theme beats legacy', prefs: '{"theme":"dark"}', theme: 'light' },
  { name: 'invalid legacy theme', theme: 'blue' },
  { name: 'corrupt JSON', prefs: '{oops', theme: 'light' },
  { name: 'JSON null', prefs: 'null', theme: 'light' },
  { name: 'JSON number', prefs: '5' },
  { name: 'JSON array', prefs: '[]' },
  { name: 'storage blocked', throws: true },
]

describe('pre-paint script in app/index.html', () => {
  const src = prePaintScript('app/index.html')

  it.each(CASES)('matches parsePrefs: $name', c => {
    const expected = c.throws ? DEFAULTS : parsePrefs(c.prefs ?? null, c.theme ?? null)
    expect(runScript(src, c).dataset).toEqual({ ...expected })
  })

  it('knows every option and default from prefs.ts', () => {
    // Every value of every option must be accepted by the script.
    for (const k of Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]) {
      for (const v of OPTIONS[k]) {
        expect(runScript(src, { prefs: JSON.stringify({ [k]: v }) }).dataset[k]).toBe(v)
      }
    }
  })

  it('is deployed unchanged in the built root index.html', () => {
    if (!existsSync('index.html')) return
    expect(prePaintScript('index.html')).toBe(src)
  })
})
