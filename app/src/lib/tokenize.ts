/**
 * Real BPE tokenization in the browser with OpenAI's published vocabularies, via the open-source
 * gpt-tokenizer library (MIT). Each vocabulary is about 0.5–1 MB, so it's downloaded only when a
 * visitor asks for it, once, and cached. No network calls besides that file; no keys.
 */
export const ENCODINGS = {
  o200k_base: { models: 'GPT-4o and the o-series', vocab: '≈200k tokens' },
  cl100k_base: { models: 'GPT-4 and GPT-3.5 Turbo', vocab: '≈100k tokens' },
} as const
export type EncodingName = keyof typeof ENCODINGS

/** Sample sentences for the playground (written for it; not project data). */
export const TOKEN_EXAMPLES = [
  { label: 'English', text: 'Tokenizers split text into pieces a model has seen before.' },
  { label: 'Punctuation', text: 'Wait—what?! It’s “state-of-the-art”… isn’t it? (Yes; no.)' },
  { label: 'Numbers', text: 'Order #4521: ₹1,299.50 paid on 21/10/2026 at 09:45, GST 18%.' },
  { label: 'Hindi', text: 'ट्रेन प्लेटफ़ॉर्म नंबर तीन पर आ रही है।' },
  { label: 'Telugu', text: 'రైలు మూడో నంబర్ ప్లాట్‌ఫామ్‌పైకి వస్తోంది.' },
  { label: 'Hinglish', text: 'Train platform 3 pe aa rahi hai, jaldi chalo!' },
]
export type Encoder = { encode: (text: string) => number[]; decode: (ids: number[]) => string }

const loaders: Record<EncodingName, () => Promise<Encoder>> = {
  o200k_base: () => import('gpt-tokenizer/encoding/o200k_base').then(m => ({ encode: m.encode, decode: m.decode })),
  cl100k_base: () => import('gpt-tokenizer/encoding/cl100k_base').then(m => ({ encode: m.encode, decode: m.decode })),
}
const cache = new Map<EncodingName, Promise<Encoder>>()

/** Load (once) and return an encoder. A failed load isn't cached, so Retry can try again. */
export function loadEncoder(name: EncodingName): Promise<Encoder> {
  let p = cache.get(name)
  if (!p) {
    p = loaders[name]().catch(e => { cache.delete(name); throw e })
    cache.set(name, p)
  }
  return p
}

export type Piece = { id: number; text: string; partial: boolean }

/**
 * The text as tokens. A token can hold only part of a character's UTF-8 bytes (common for scripts
 * like Devanagari or Telugu); decoded alone it isn't valid text, so it's marked `partial`.
 */
export function pieces(enc: Encoder, text: string): Piece[] {
  return enc.encode(text).map(id => {
    const t = enc.decode([id])
    return { id, text: t, partial: t.includes('�') }
  })
}
