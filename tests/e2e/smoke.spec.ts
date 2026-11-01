import { expect, test } from '@playwright/test'
import { trackErrors } from './helpers'

test.describe('smoke', () => {
  test('loads with no console errors or failed requests, in both themes', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Jayanth Vukkisa' })).toBeVisible()
    await page.getByRole('button', { name: /Switch to light theme/ }).click()
    // Scroll through so lazy images (both themes' covers) load.
    for (let y = 0; y < 12000; y += 900) await page.mouse.wheel(0, 900)
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('every section is present, in order, with its ID', async ({ page }) => {
    await page.goto('/')
    const ids = await page.locator('main > section').evaluateAll(els => els.map(e => e.id))
    expect(ids).toEqual(['top', 'work', 'journey', 'lab', 'about', 'contact'])
    for (const id of ['knowyourrules', 'ai-surveillance', 'speech-recognition', 'ez-learn', 'lab-rag', 'lab-zone', 'lab-tokens', 'design-tokens']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
  })

  test('every in-page link points at an element that exists', async ({ page }) => {
    await page.goto('/')
    const missing = await page.locator('a[href^="#"]').evaluateAll(as =>
      as.map(a => a.getAttribute('href')!).filter(h => h.length > 1 && !document.getElementById(h.slice(1))),
    )
    expect(missing).toEqual([])
  })

  test('external links open safely in a new tab', async ({ page }) => {
    await page.goto('/')
    const bad = await page.locator('a[href^="http"]').evaluateAll(as =>
      as.filter(a => a.getAttribute('target') !== '_blank' || !/noopener/.test(a.getAttribute('rel') ?? '')).map(a => a.getAttribute('href')),
    )
    expect(bad).toEqual([])
  })

  test('the page does not shift while loading (CLS)', async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver(list => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01)
  })

  test('rendered text keeps to the content rules', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('body').innerText()
    expect(text).not.toMatch(/drows|mediapipe|cab audio|I started with SQL/i)
    // Project covers are illustrations, and say so.
    await expect(page.locator('.cover').filter({ hasText: 'illustration' })).toHaveCount(4)
  })
})
