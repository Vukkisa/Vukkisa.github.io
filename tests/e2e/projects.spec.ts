import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { setPrefs } from './helpers'

const AI = [
  { id: 'knowyourrules', label: /KnowYourRules RAG pipeline/ },
  { id: 'ai-surveillance', label: /AI Surveillance/ },
  { id: 'speech-recognition', label: /railway speech-recognition pipeline/ },
]
const ALL = ['knowyourrules', 'ai-surveillance', 'speech-recognition', 'ez-learn']

test.describe('project diagrams', () => {
  test('the three AI projects show a labelled diagram; Ez-Learn keeps its cover', async ({ page }) => {
    await page.goto('/')
    for (const p of AI) {
      const card = page.locator(`#${p.id}`)
      await expect(card.locator('.cover').getByText('Illustration', { exact: true })).toBeVisible()
      await expect(card.getByRole('img', { name: p.label })).toHaveCount(1)
      await expect(card.getByRole('img', { name: p.label })).toHaveAttribute('aria-label', /^Illustration/)
    }
    await expect(page.locator('#ez-learn .cover img')).toHaveCount(2) // light and dark versions
  })

  test('at rest (reduced motion) each diagram shows its final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const opacity = (sel: string) => page.locator(sel).first().evaluate(e => getComputedStyle(e).opacity)
    expect(await opacity('#ai-surveillance .pv-alert')).toBe('1')
    expect(await opacity('#knowyourrules .pv-hit')).toBe('1')
    expect(await opacity('#speech-recognition .pv-scan')).toBe('0') // the vote highlight only exists while moving
  })
})

test.describe('case studies', () => {
  test('every project has a closed case study with all five parts', async ({ page }) => {
    await page.goto('/')
    for (const id of ALL) {
      const cs = page.locator(`#${id}-case`)
      await expect(cs).not.toHaveAttribute('open', '')
      await cs.locator('summary').click()
      await expect(cs).toHaveAttribute('open', '')
      for (const h of ['How it works', 'My part', 'Evaluation so far', 'Limitations', 'Code and demo']) {
        await expect(cs.getByRole('heading', { level: 4, name: h })).toBeVisible()
      }
      expect(await cs.locator('ol > li').count()).toBeGreaterThanOrEqual(4)
    }
  })

  test('opens and closes from the keyboard, and the summary names the project', async ({ page }) => {
    await page.goto('/')
    const summary = page.locator('#knowyourrules-case summary')
    await expect(summary).toContainText('Case study')
    expect(await summary.evaluate(e => e.textContent)).toContain('KnowYourRules') // screen-reader text
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#knowyourrules-case')).toHaveAttribute('open', '')
    await page.keyboard.press('Space')
    await expect(page.locator('#knowyourrules-case')).not.toHaveAttribute('open', '')
  })

  test('a link to #<project>-case opens it and scrolls it into view', async ({ page }) => {
    await page.goto('/#ai-surveillance-case')
    const cs = page.locator('#ai-surveillance-case')
    await expect(cs).toHaveAttribute('open', '')
    await expect(cs.getByRole('heading', { name: 'How it works' })).toBeInViewport()
  })

  test('the command menu opens a case study and focuses it', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('speech recognition case')
    await page.keyboard.press('Enter')
    await expect(page.locator('#speech-recognition-case')).toHaveAttribute('open', '')
    await expect(page.locator('#speech-recognition-case summary')).toBeFocused()
  })

  test('evaluation is stated honestly: no invented numbers', async ({ page }) => {
    await page.goto('/')
    for (const id of ALL) await page.locator(`#${id}-case summary`).click()
    const work = await page.locator('#work').innerText()
    expect(work).not.toMatch(/\d+(\.\d+)?\s?%/)                 // no percentages anywhere in Work
    expect(work).not.toMatch(/accuracy of|WER of|precision|recall|F1/i)
    await expect(page.locator('#speech-recognition-case')).toContainText('can’t be shared yet')
    await expect(page.locator('#knowyourrules-case')).toContainText('Not evaluated yet')
    await expect(page.locator('#ai-surveillance-case')).toContainText('No accuracy or speed results recorded yet')
  })

  for (const theme of ['dark', 'light']) {
    for (const width of [390, 1440]) {
      test(`axe with every case study open: ${theme} at ${width}px`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await setPrefs(page, { theme })
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        await page.evaluate(() => document.querySelectorAll('details.case').forEach(d => { (d as HTMLDetailsElement).open = true }))
        const { violations } = await new AxeBuilder({ page }).include('#work').analyze()
        expect(violations.map(v => `${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)).toEqual([])
      })
    }
  }
})
