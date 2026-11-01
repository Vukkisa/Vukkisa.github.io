// Renders the social preview image (app/public/og.png, 1200×630) from the site's own tokens:
// the dark background, the cobalt accent, Bricolage for the name and line, Geist Mono for the
// labels, loaded from the same font packages the site uses. Run `npm run og`, then `npm run build`.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Inlined as data URLs: a page built with setContent can't load file:// fonts.
const font = (pkg, file) => {
  const bytes = readFileSync(new URL(`../node_modules/@fontsource-variable/${pkg}/files/${file}-latin-wght-normal.woff2`, import.meta.url))
  return `data:font/woff2;base64,${bytes.toString('base64')}`
}
const out = fileURLToPath(new URL('../app/public/og.png', import.meta.url))

// The wave echoes the hero's speech illustration: fixed heights, so the image is reproducible.
const bars = Array.from({ length: 46 }, (_, i) => {
  const env = Math.sin((i / 45) * Math.PI) ** 0.6
  const h = Math.round(10 + env * (40 + 34 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))))
  return `<i style="height:${h}px"${i >= 18 && i <= 27 ? ' class="on"' : ''}></i>`
}).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Bricolage; src: url(${font('bricolage-grotesque', 'bricolage-grotesque')}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: GeistMono; src: url(${font('geist-mono', 'geist-mono')}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0a0a0b; color: #f4f4f2; font-family: Bricolage; overflow: hidden; position: relative;
  background-image: radial-gradient(#222226 1.2px, transparent 1.3px); background-size: 28px 28px; }
.page { position: absolute; inset: 0; padding: 64px 80px; display: flex; flex-direction: column; }
.top { display: flex; align-items: center; gap: 18px; }
.mark { width: 48px; height: 48px; border-radius: 12px; background: #f4f4f2; color: #0a0a0b; display: grid; place-items: center; font: 600 19px Bricolage; }
.kicker { font: 500 19px GeistMono; letter-spacing: .08em; text-transform: uppercase; }
.name { margin-top: 44px; font: 600 128px/0.92 Bricolage; letter-spacing: -.045em; }
.line { margin-top: 30px; font: 500 40px/1.18 Bricolage; letter-spacing: -.02em; max-width: 900px; }
.mute { color: #9a9aa2; } .acc { color: #8e9cff; }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; font: 400 19px GeistMono; color: #9a9aa2; }
.foot b { color: #f4f4f2; font-weight: 500; }
.wave { position: absolute; right: 80px; bottom: 112px; display: flex; align-items: center; gap: 5px; height: 120px; }
.wave i { display: block; width: 4px; border-radius: 2px; background: #36363c; }
.wave i.on { background: #8e9cff; }
</style></head><body>
<div class="wave">${bars}</div>
<div class="page">
  <div class="top"><div class="mark">JV</div><p class="kicker">AI engineering · Applied ML</p></div>
  <h1 class="name">Jayanth Vukkisa</h1>
  <p class="line">I build AI that <span class="mute">reads the rules, watches the zone</span> <span class="acc">and listens through the noise.</span></p>
  <div class="foot"><span>RAG · computer vision · speech recognition</span><b>vukkisa.github.io</b></div>
</div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
const missing = await page.evaluate(() => ['Bricolage', 'GeistMono'].filter(f => !document.fonts.check(`16px ${f}`)))
if (missing.length) throw new Error(`fonts not loaded: ${missing.join(', ')}`)
await page.screenshot({ path: out })
await browser.close()
console.log(`wrote ${out}`)
