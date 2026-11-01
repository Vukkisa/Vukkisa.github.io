// Renders the résumé PDF from its editable source: resume/resume.html → assests/Jayanth_Vukkisa_Resume.pdf
// (the path the portfolio links to; GitHub Pages serves it straight from the repo root).
// Uses Playwright's Chromium, so the PDF has real, selectable text. Run `npm run resume`.
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const src = new URL('../resume/resume.html', import.meta.url)
const out = fileURLToPath(new URL('../assests/Jayanth_Vukkisa_Resume.pdf', import.meta.url))

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(src.href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
const missing = await page.evaluate(() => ['Bricolage', 'Geist'].filter(f => !document.fonts.check(`12px ${f}`)))
if (missing.length) throw new Error(`fonts not loaded: ${missing.join(', ')}`)
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false })
await browser.close()
console.log(`wrote ${out}`)
