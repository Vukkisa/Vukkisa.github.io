import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { setPrefs, type StoredPrefs } from './helpers'

// Reduced motion so scroll reveals don't leave content mid-fade while axe checks contrast.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

const WIDTHS = [320, 768, 1440]
const COMBOS: { name: string; prefs: StoredPrefs }[] = [
  { name: 'dark', prefs: { theme: 'dark' } },
  { name: 'light', prefs: { theme: 'light' } },
  // Lowest-contrast accent in light mode, plus larger text and round corners.
  { name: 'light + moss + large text', prefs: { theme: 'light', accent: 'moss', text: 'lg', radius: 'round' } },
]

for (const combo of COMBOS) {
  for (const width of WIDTHS) {
    test(`axe: ${combo.name} at ${width}px`, async ({ page }) => {
      await setPrefs(page, combo.prefs)
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const { violations } = await new AxeBuilder({ page }).analyze()
      const summary = violations.map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)
      expect(summary).toEqual([])
    })

    test(`no horizontal scrolling: ${combo.name} at ${width}px`, async ({ page }) => {
      await setPrefs(page, combo.prefs)
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    })
  }
}

test('keyboard: every focus stop shows a visible focus indicator', async ({ page }) => {
  await page.goto('/')
  const missing: string[] = []
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      if (el.dataset.seen) return 'loop'
      el.dataset.seen = '1'
      const s = getComputedStyle(el)
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0
      // SVG handles in the zone check draw their own ring on the first circle instead.
      const ring = el.matches('g[role=button]') && getComputedStyle(el.querySelector('circle')!).strokeWidth === '3px'
      // Visually hidden radios show focus on their label.
      const label = el.matches('input.sr-only') && getComputedStyle(el.closest('label')!).outlineStyle !== 'none'
      return { name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40), ok: outline || ring || label }
    })
    if (r === null || r === 'loop') break
    if (!r.ok) missing.push(r.name)
  }
  expect(missing).toEqual([])
})

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})
