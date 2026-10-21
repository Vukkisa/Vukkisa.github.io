/**
 * Content guards. content.ts is the single source for every word on the site, so: nothing in it
 * should be dead (an unused copy drifts out of date unnoticed), and it must never mention work the
 * owner asked to keep off the site or claims that aren't backed up.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as content from '../../app/src/data/content'

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? sources(p) : /\.(tsx?|css)$/.test(f) ? [p] : []
  })
}
const appCode = sources('app/src')
  .filter(f => !f.endsWith('data/content.ts'))
  .map(f => readFileSync(f, 'utf8'))
  .join('\n')

describe('content.ts', () => {
  it('has no unused exports or intro fields (B5)', () => {
    const unusedExports = Object.keys(content).filter(name => !new RegExp(`\\b${name}\\b`).test(appCode))
    const unusedIntro = Object.keys(content.intro).filter(key => !new RegExp(`intro\\.${key}\\b|\\b${key}\\b[^:]*=\\s*intro\\b`).test(appCode))
    expect({ unusedExports, unusedIntro }).toEqual({ unusedExports: [], unusedIntro: [] })
  })

  it('never mentions excluded work or wording', () => {
    const text = readFileSync('app/src/data/content.ts', 'utf8')
    expect(text).not.toMatch(/drows/i)
    expect(text).not.toMatch(/mediapipe/i)
    expect(text).not.toMatch(/cab audio/i)
    expect(text).not.toMatch(/I started with SQL/i)
  })

  it('every project says what I built and what the evidence is', () => {
    for (const p of content.projects) {
      expect(p.built.length, p.id).toBeGreaterThan(40)
      expect(p.evidence.length, p.id).toBeGreaterThan(10)
      expect(p.links.length > 0 || !!p.privateNote, `${p.id} needs a link or a privacy note`).toBe(true)
    }
  })
})
