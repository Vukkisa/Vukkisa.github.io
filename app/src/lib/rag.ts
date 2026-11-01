/**
 * A small, real retrieval pipeline that runs in the browser, used by the Lab's RAG experiment.
 * It indexes this site's own text (no invented documents) with TF-IDF keyword vectors and ranks
 * chunks by cosine similarity. That is a stand-in for neural embeddings, and the experiment says
 * so. Nothing here calls a language model or the network. Pure functions, unit-tested.
 */

export type Doc = { id: string; title: string; text: string }
export type Chunk = { id: string; doc: string; title: string; n: number; text: string }
export type Index = { chunks: Chunk[]; vectors: Map<string, number>[]; idf: Map<string, number> }
export type Hit = { chunk: Chunk; score: number; shared: string[] }

const STOP = new Set(('a an and are as at be but by can for from has have how i in into is it its it’s of on or so that the their them then there these this to was were what when where which who why will with you your my me we our do does did not no only than too very also each every just about after before over under more most some any one two'.split(' ')))

/** Lower-case word terms, without punctuation or common stop words. Handles accented and Indic letters. */
export function terms(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’-]*/gu) ?? [])
    .map(t => t.replace(/['’]s$/, '').replace(/[-'’]+$/, ''))
    .filter(t => t.length > 1 && !STOP.has(t))
    // Fold simple plurals ("rules" → "rule"), so a question and a document can use either form.
    .map(t => (t.length > 3 && t.endsWith('s') && !/(ss|us|is)$/.test(t) ? t.slice(0, -1) : t))
}

const words = (text: string) => text.split(/\s+/).filter(Boolean)
/** Sentences, split after . ! or ? followed by a space. */
export const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).map(t => t.trim()).filter(Boolean)

/**
 * Split each document into chunks of whole sentences, up to `size` words each (a longer sentence
 * becomes a chunk on its own). With `overlap`, each chunk starts with the previous chunk's last
 * sentence, so a fact that straddles a boundary is still found in one piece.
 */
export function chunkDocs(docs: readonly Doc[], size: number, overlap: boolean): Chunk[] {
  if (size < 1) throw new Error('chunk size must be positive')
  const out: Chunk[] = []
  for (const d of docs) {
    const ss = sentences(d.text)
    let n = 0
    let i = 0
    while (i < ss.length) {
      const take = [ss[i]]
      let count = words(ss[i]).length
      while (i + take.length < ss.length && count + words(ss[i + take.length]).length <= size) {
        count += words(ss[i + take.length]).length
        take.push(ss[i + take.length])
      }
      n++
      out.push({ id: `${d.id}#${n}`, doc: d.id, title: d.title, n, text: take.join(' ') })
      const next = i + take.length
      if (next >= ss.length) break
      i = overlap && take.length > 1 ? next - 1 : next
    }
  }
  return out
}

/** TF-IDF vectors, L2-normalised so a dot product is the cosine similarity. */
export function buildIndex(chunks: Chunk[]): Index {
  const tfs = chunks.map(c => {
    const tf = new Map<string, number>()
    for (const t of terms(c.text)) tf.set(t, (tf.get(t) ?? 0) + 1)
    return tf
  })
  const df = new Map<string, number>()
  for (const tf of tfs) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1)
  const idf = new Map<string, number>()
  for (const [t, n] of df) idf.set(t, Math.log((1 + chunks.length) / (1 + n)) + 1)
  const vectors = tfs.map(tf => normalise(new Map([...tf].map(([t, n]) => [t, (1 + Math.log(n)) * idf.get(t)!]))))
  return { chunks, vectors, idf }
}

function normalise(v: Map<string, number>) {
  const norm = Math.sqrt([...v.values()].reduce((a, x) => a + x * x, 0)) || 1
  return new Map([...v].map(([t, x]) => [t, x / norm]))
}

/** The query as a vector in the same space (unknown words are dropped: they appear in no chunk). */
export function queryVector(index: Index, query: string) {
  const tf = new Map<string, number>()
  for (const t of terms(query)) if (index.idf.has(t)) tf.set(t, (tf.get(t) ?? 0) + 1)
  return normalise(new Map([...tf].map(([t, n]) => [t, (1 + Math.log(n)) * index.idf.get(t)!])))
}

/** The k chunks most similar to the query, best first. Chunks with no shared term are left out. */
export function retrieve(index: Index, query: string, k: number): Hit[] {
  const q = queryVector(index, query)
  return index.vectors
    .map((v, i) => {
      let score = 0
      const shared: string[] = []
      for (const [t, w] of q) { const x = v.get(t); if (x) { score += w * x; shared.push(t) } }
      return { chunk: index.chunks[i], score, shared }
    })
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, k)
}

/** A chunk's strongest terms, for showing what its vector "looks like". */
export function topTerms(index: Index, chunkIndex: number, n: number) {
  return [...index.vectors[chunkIndex]].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
}

/** The prompt pattern KnowYourRules uses: answer only from labelled context, or say it isn't covered. */
export function buildPrompt(hits: Hit[], question: string) {
  const context = hits.map(h => `[Source: ${h.chunk.title} · chunk ${h.chunk.n}]\n${h.chunk.text}`).join('\n\n')
  return `Answer only from the context below. If the context doesn't cover the question, say so.\n\n${context || '(no context retrieved)'}\n\nQuestion: ${question}`
}

/**
 * An extractive "answer": the retrieved sentence that shares the most (IDF-weighted) terms with the
 * question, with its source. Not generated text. Returns null when nothing relevant was retrieved.
 */
export function extractAnswer(index: Index, hits: Hit[], question: string, minScore = 0.08) {
  if (!hits.length || hits[0].score < minScore) return null
  const q = new Set(terms(question))
  let best: { sentence: string; source: Chunk; weight: number } | null = null
  for (const h of hits) {
    for (const sentence of sentences(h.chunk.text)) {
      const weight = [...new Set(terms(sentence))].filter(t => q.has(t)).reduce((a, t) => a + (index.idf.get(t) ?? 0), 0)
      if (weight > 0 && (!best || weight > best.weight)) best = { sentence, source: h.chunk, weight }
    }
  }
  return best
}
