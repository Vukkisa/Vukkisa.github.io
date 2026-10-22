/**
 * Regression tests for the bugs confirmed in the audit (B1–B6) and the duplicate listeners. Each one
 * was first committed as an expected failure and seen to fail against the old code for the right
 * reason, then fixed; they now guard against the bug coming back.
 */
import { expect, test, type Page } from '@playwright/test'
import { loopingAnimations, scrollToY, setPrefs } from './helpers'

/** Font size of every visible element that holds text directly, below display size. */
async function textSizes(page: Page) {
  return page.evaluate(() => {
    const out: { key: string; size: number }[] = []
    document.querySelectorAll<HTMLElement>('body *').forEach((el, i) => {
      // Diagram labels inside SVGs scale with the drawing, not with the text-size control.
      if (el.closest('dialog, noscript, script, style, svg')) return
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim())
      if (!hasText) return
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size >= 32) return // display type is sized by the viewport on purpose
      out.push({ key: `${i}:${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').split(' ')[0]}:${el.textContent!.trim().slice(0, 24)}`, size })
    })
    return out
  })
}

for (const width of [1440, 390]) {
  test(`B1: the Aa button enlarges all body text, labels and navigation (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const before = await textSizes(page)
    await page.getByRole('button', { name: 'Larger text' }).click()
    const after = new Map((await textSizes(page)).map(t => [t.key, t.size]))
    const notScaled = before.filter(t => after.has(t.key) && after.get(t.key)! < t.size * 1.1).map(t => `${t.key} (${t.size}px)`)
    expect(before.length).toBeGreaterThan(100)
    expect(notScaled).toEqual([])
  })
}

test('B2: the browser theme-color follows the theme', async ({ page }) => {
  const themeColor = () => page.locator('meta[name="theme-color"]').evaluateAll(ms => ms.map(m => m.getAttribute('content')))
  await page.goto('/')
  expect(await themeColor()).toEqual(['#0a0a0b'])
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  expect(await themeColor()).toEqual(['#f7f7f4'])
  await page.reload() // and it's right from the first paint for a saved light theme
  expect(await themeColor()).toEqual(['#f7f7f4'])
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('B3: section navigation is visible without opening the menu', async ({ page }) => {
    await page.goto('/')
    const links = page.getByRole('navigation', { name: 'Sections' }).getByRole('link')
    await expect(links).toHaveCount(5)
    for (const link of await links.all()) await expect(link).toBeVisible()
  })

  test('B3: tapping Menu opens the command menu without focusing the search box (no keyboard pop-up)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).tap()
    await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible()
    await expect(page.getByRole('combobox')).not.toBeFocused()
    // Still fully usable by tapping.
    await page.getByRole('option', { name: 'Lab' }).tap()
    await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeHidden()
  })
})

test('B4: navigation and section headings have clean accessible names', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Sections' })
  for (const name of ['work (4 projects)', 'journey', 'lab (3 experiments)', 'about', 'contact']) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(1)
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Selected work (4 projects)', exact: true })).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 2, name: 'Lab (3 experiments)', exact: true })).toHaveCount(1)
})

test('B6: looping animations pause when they are off screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect.poll(async () => (await loopingAnimations(page)).some(a => a.state === 'running')).toBe(true) // still alive at the top
  await scrollToY(page, 1e6) // the bottom of the page: hero and journey are far away
  await expect.poll(async () => (await loopingAnimations(page)).filter(a => a.state === 'running')).toEqual([])
  await scrollToY(page, 0) // and they resume
  await expect.poll(async () => (await loopingAnimations(page)).some(a => a.state === 'running')).toBe(true)
})

test('B6: nothing loops when the visitor prefers reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await setPrefs(page, {})
  await page.goto('/')
  expect(await loopingAnimations(page)).toEqual([])
  await scrollToY(page, 4000)
  expect(await loopingAnimations(page)).toEqual([])
})

test('one scroll listener and one keydown listener on window', async ({ page }) => {
  await page.goto('/')
  const cdp = await page.context().newCDPSession(page)
  const { result } = await cdp.send('Runtime.evaluate', { expression: 'window' })
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId! })
  const count = (t: string) => listeners.filter(l => l.type === t).length
  expect({ scroll: count('scroll'), keydown: count('keydown') }).toEqual({ scroll: 1, keydown: 1 })
})
