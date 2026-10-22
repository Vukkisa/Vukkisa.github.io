/** The real tokenizers behind the Lab's token playground (loaded the same way as in the browser). */
import { describe, expect, it } from 'vitest'
import { loadEncoder, pieces, TOKEN_EXAMPLES } from '../../app/src/lib/tokenize'

describe('tokenizers', async () => {
  const o200k = await loadEncoder('o200k_base')
  const cl100k = await loadEncoder('cl100k_base')

  it('are the real vocabularies (known IDs)', () => {
    expect(cl100k.encode('hello world')).toEqual([15339, 1917])
  })

  it('round-trip every example exactly', () => {
    for (const e of TOKEN_EXAMPLES) {
      expect(o200k.decode(o200k.encode(e.text)), e.label).toBe(e.text)
      expect(cl100k.decode(cl100k.encode(e.text)), e.label).toBe(e.text)
    }
  })

  it('split digits into groups of at most three (as the playground says)', () => {
    for (const enc of [o200k, cl100k]) {
      const digitTokens = pieces(enc, '1234567890').map(p => p.text)
      expect(digitTokens.join('')).toBe('1234567890')
      for (const t of digitTokens) expect(t.length).toBeLessThanOrEqual(3)
    }
  })

  it('o200k needs fewer tokens than cl100k for the Hindi and Telugu examples (as the playground says)', () => {
    for (const label of ['Hindi', 'Telugu']) {
      const text = TOKEN_EXAMPLES.find(e => e.label === label)!.text
      expect(o200k.encode(text).length, label).toBeLessThan(cl100k.encode(text).length)
    }
  })

  it('marks tokens that hold only part of a character', () => {
    const telugu = TOKEN_EXAMPLES.find(e => e.label === 'Telugu')!.text
    const ps = pieces(cl100k, telugu)
    expect(ps.some(p => p.partial)).toBe(true)
    expect(pieces(cl100k, 'plain English text').some(p => p.partial)).toBe(false)
  })
})
