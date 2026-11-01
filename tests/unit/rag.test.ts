import { describe, expect, it } from 'vitest'
import { siteDocs } from '../../app/src/data/corpus'
import { buildIndex, buildPrompt, chunkDocs, extractAnswer, retrieve, sentences, terms, topTerms, type Doc } from '../../app/src/lib/rag'

const docs: Doc[] = [
  { id: 'a', title: 'Alpha', text: 'The train stops at platform three. Tickets are sold at the counter. Platform three is near the exit.' },
  { id: 'b', title: 'Beta', text: 'Buses leave from the depot every hour. The depot opens at six.' },
]

describe('terms', () => {
  it('lower-cases, drops stop words and punctuation, and folds simple plurals', () => {
    expect(terms('The Rules, and the rule’s documents!')).toEqual(['rule', 'rule', 'document'])
  })
  it('keeps letters from Indian scripts', () => {
    expect(terms('ट्रेन प्लेटफ़ॉर्म')).toEqual(['ट्रेन', 'प्लेटफ़ॉर्म'])
  })
})

describe('chunkDocs', () => {
  it('keeps whole sentences and stays within the word limit', () => {
    for (const c of chunkDocs(docs, 12, false)) {
      expect(c.text).toMatch(/[.!?]$/)
      expect(c.text.split(/\s+/).length).toBeLessThanOrEqual(12)
    }
  })
  it('with overlap, each chunk starts with the previous chunk’s last sentence', () => {
    const cs = chunkDocs(docs, 14, true).filter(c => c.doc === 'a')
    expect(cs.length).toBeGreaterThan(1)
    expect(cs[1].text.startsWith(sentences(cs[0].text).at(-1)!)).toBe(true)
  })
  it('numbers chunks per document and makes a long sentence its own chunk', () => {
    const cs = chunkDocs([{ id: 'x', title: 'X', text: 'one two three four five six seven. Eight.' }], 3, false)
    expect(cs.map(c => c.id)).toEqual(['x#1', 'x#2'])
    expect(cs[0].text).toBe('one two three four five six seven.')
  })
  it('rejects a non-positive size', () => {
    expect(() => chunkDocs(docs, 0, false)).toThrow()
  })
})

describe('index and retrieval', () => {
  const index = buildIndex(chunkDocs(docs, 12, false))
  it('vectors are unit length', () => {
    for (const v of index.vectors) expect(Math.hypot(...v.values())).toBeCloseTo(1, 6)
  })
  it('ranks the chunk that shares the rarer words first, and reports shared terms', () => {
    const hits = retrieve(index, 'Which platform does the train stop at?', 4)
    expect(hits[0].chunk.doc).toBe('a')
    expect(hits[0].shared).toEqual(expect.arrayContaining(['platform', 'train']))
    for (let i = 1; i < hits.length; i++) expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score)
  })
  it('retrieves nothing when no word is shared, and the answer says it isn’t covered', () => {
    const hits = retrieve(index, 'quantum chromodynamics', 4)
    expect(hits).toEqual([])
    expect(extractAnswer(index, hits, 'quantum chromodynamics')).toBeNull()
  })
  it('top terms are sorted by weight', () => {
    const t = topTerms(index, 0, 3)
    expect(t.length).toBe(3)
    expect(t[0][1]).toBeGreaterThanOrEqual(t[2][1])
  })
  it('the prompt labels every chunk with its source and states the grounding rule', () => {
    const hits = retrieve(index, 'depot', 2)
    const prompt = buildPrompt(hits, 'When does the depot open?')
    expect(prompt).toMatch(/^Answer only from the context below/)
    expect(prompt).toContain('[Source: Beta · chunk 1]')
    expect(prompt).toMatch(/Question: When does the depot open\?$/)
  })
})

describe('the Lab’s example questions over this site’s text', () => {
  const index = buildIndex(chunkDocs(siteDocs, 60, true))
  const ask = (q: string) => extractAnswer(index, retrieve(index, q, 4), q)
  it('answers from the right project, with a whole sentence', () => {
    expect(ask('Which models were benchmarked?')?.sentence).toMatch(/benchmarked Indic-Conformer, Qwen3-ASR and Whisper/)
    expect(ask('What is indexed so far?')?.sentence).toMatch(/Motor Vehicles Act and Rules, Gujarat and Delhi/)
    expect(ask('Where did Jayanth work as a Data Developer?')?.sentence).toMatch(/Tata Consultancy Services/)
  })
  it('says an off-topic question isn’t covered', () => {
    expect(ask('What is the capital of France?')).toBeNull()
  })
})
