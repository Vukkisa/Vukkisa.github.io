// JavaScript and CSS size budget for the built site (run after `npm run build`: `npm run size`).
//
// What it measures: the files the browser downloads on first load (the entry script, any chunks
// it preloads, and the stylesheet, as named in the built index.html), gzipped at level 9. The
// tokenizer vocabularies are reported separately: they're lazy chunks the visitor downloads only
// by pressing "Load tokenizers", so they must never be preloaded or imported statically.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

/** Budgets in kB (1000 bytes), gzipped. Set a little above the measured size so normal changes fit. */
const BUDGET = {
  initialJs: 110,   // measured at about 100 kB in Phase 5 (React, the app, the Lab engines)
  css: 14,          // measured at about 11 kB
}
const LAZY_TOKENIZER = /^(o200k_base|cl100k_base|GptEncoding)-.*\.js$/

const kb = n => (n / 1000).toFixed(1)
const gz = file => gzipSync(readFileSync(`static/${file}`), { level: 9 }).length
const html = readFileSync('index.html', 'utf8')
const refs = re => [...html.matchAll(re)].map(m => m[1].replace(/^\/static\//, ''))

const entry = refs(/<script type="module"[^>]*src="([^"]+)"/g)
const preloaded = refs(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)
const css = refs(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)
const initial = [...entry, ...preloaded]
const js = readdirSync('static').filter(f => f.endsWith('.js'))
const tokenizer = js.filter(f => LAZY_TOKENIZER.test(f))
const otherLazy = js.filter(f => !initial.includes(f) && !tokenizer.includes(f))

const failures = []
if (entry.length !== 1) failures.push(`expected one entry script in index.html, found ${entry.length}`)
const initialJs = initial.reduce((a, f) => a + gz(f), 0)
const cssSize = css.reduce((a, f) => a + gz(f), 0)
if (initialJs > BUDGET.initialJs * 1000) failures.push(`first-load JavaScript is ${kb(initialJs)} kB gzipped, over the ${BUDGET.initialJs} kB budget`)
if (cssSize > BUDGET.css * 1000) failures.push(`CSS is ${kb(cssSize)} kB gzipped, over the ${BUDGET.css} kB budget`)

// The tokenizers stay lazy: separate chunks, not preloaded, reached only through import().
const entrySource = entry[0] ? readFileSync(`static/${entry[0]}`, 'utf8') : ''
for (const name of ['o200k_base', 'cl100k_base']) {
  const file = tokenizer.find(f => f.startsWith(`${name}-`))
  if (!file) { failures.push(`no separate ${name} chunk: the vocabulary may have been bundled into the main script`); continue }
  if (initial.includes(file) || html.includes(file)) failures.push(`${file} is loaded or preloaded on first visit`)
  if (!new RegExp(`import\\(\\s*["'\`][^"'\`]*${file.replace('.', '\\.')}`).test(entrySource)) failures.push(`${file} isn't reached through a dynamic import()`)
}

const row = (label, files) => console.log(`  ${label.padEnd(34)} ${kb(files.reduce((a, f) => a + gz(f), 0)).padStart(7)} kB   ${files.join(', ')}`)
console.log('Gzipped sizes (level 9):')
row(`First-load JS (budget ${BUDGET.initialJs} kB)`, initial)
row(`CSS (budget ${BUDGET.css} kB)`, css)
row('Tokenizers (only on request)', tokenizer)
if (otherLazy.length) row('Other lazy chunks', otherLazy)

if (failures.length) {
  console.error(`\nSize check failed:\n${failures.map(f => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nWithin budget.')
