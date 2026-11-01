import { expect, test } from '@playwright/test'
import { loopingAnimations } from './helpers'

test.describe('hero', () => {
  test('says what the work is, by whom, with real facts', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('#top')
    await expect(hero.getByText('AI engineering · Applied ML')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Jayanth Vukkisa')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('reads the rules, watches the zone and listens through the noise.')
    await expect(hero).toContainText('Associate Data Scientist intern at AiSpry')
    await expect(hero).toContainText('Jio Institute')
  })

  test('the two calls to action go to Projects and the Lab', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#top').getByRole('link', { name: 'View projects' })).toHaveAttribute('href', '#work')
    await expect(page.locator('#top').getByRole('link', { name: 'Open the Lab' })).toHaveAttribute('href', '#lab')
  })

  // Desktop and tablet windows, then phones (emulated as phones: mobile viewport and touch).
  const SCREENS: { width: number; height: number; phone?: boolean }[] = [
    { width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 768, height: 1024 },
    { width: 390, height: 844, phone: true }, { width: 360, height: 740, phone: true }, { width: 320, height: 568, phone: true },
  ]
  for (const { width, height, phone } of SCREENS) {
    test.describe(`${width}×${height}`, () => {
      // Reduced motion so the entrance offsets don't count; measured once the web fonts are in.
      test.use({ viewport: { width, height }, isMobile: !!phone, hasTouch: !!phone, contextOptions: { reducedMotion: 'reduce' } })
      test('headline and both calls to action are in the first screen', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => document.fonts.ready.then(() => undefined))
        for (const el of [page.getByRole('heading', { level: 1 }), page.getByRole('link', { name: 'View projects' }), page.getByRole('link', { name: 'Open the Lab' })]) {
          const box = (await el.boundingBox())!
          expect(box.y + box.height, `${await el.textContent()} bottom`).toBeLessThanOrEqual(height)
        }
      })
    })
  }

  test('the technical figure is labelled an illustration and fully readable without motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const fig = page.locator('#top figure')
    await expect(fig.getByText('Illustration', { exact: true })).toBeVisible()
    await expect(fig.locator('figcaption')).toContainText('Not real audio, and no results.')
    for (const stage of ['Denoise', 'Segment', 'Transcribe', 'Score']) await expect(fig.getByText(stage, { exact: true })).toBeVisible()
    // No readable text in the hero is hidden or mid-animation (the decorative hover badge is aria-hidden).
    const hidden = await page.locator('#top *').evaluateAll(els =>
      els.filter(e => !e.closest('[aria-hidden="true"]') && e.textContent!.trim() && getComputedStyle(e).opacity !== '1').map(e => e.textContent!.trim().slice(0, 30)))
    expect(hidden).toEqual([])
    expect(await loopingAnimations(page)).toEqual([])
  })

  test('with motion allowed, the figure has exactly one sweeping playhead and staged highlights', async ({ page }) => {
    await page.goto('/')
    const names = (await loopingAnimations(page)).map(a => a.name)
    expect(names.filter(n => n === 'sweep')).toHaveLength(1)
    expect(names.filter(n => n === 'stage')).toHaveLength(4)
  })
})
