import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openCard, setPrefs } from './helpers'

const AI = [
  { id: 'knowyourrules', label: /KnowYourRules RAG pipeline/ },
  { id: 'ai-surveillance', label: /AI Surveillance/ },
  { id: 'speech-recognition', label: /railway speech-recognition pipeline/ },
]
const ALL = ['knowyourrules', 'ai-surveillance', 'speech-recognition', 'ez-learn']

test.describe('project diagrams', () => {
  test('every project shows a labelled diagram, Ez-Learn included', async ({ page }) => {
    await page.goto('/')
    for (const p of AI) {
      const card = page.locator(`#${p.id}`)
      await expect(card.locator('.cover').getByText('Illustration', { exact: true })).toBeVisible()
      await expect(card.getByRole('img', { name: p.label })).toHaveCount(1)
      await expect(card.getByRole('img', { name: p.label })).toHaveAttribute('aria-label', /^Illustration/)
    }
    const ez = page.locator('#ez-learn')
    await expect(ez.locator('.cover').getByText('Illustration', { exact: true })).toBeVisible()
    await expect(ez.getByRole('img', { name: /^Illustration of Ez-Learn/ })).toHaveCount(1)
  })

  test('at rest (reduced motion) each diagram shows its final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const opacity = (sel: string) => page.locator(sel).first().evaluate(e => getComputedStyle(e).opacity)
    expect(await opacity('#ai-surveillance .pv-alert')).toBe('1')
    for (const id of ['knowyourrules', 'ez-learn']) expect(await opacity(`#${id} .pv-scene:last-of-type`)).toBe('1') // the last step shows at rest
    // speech: the route is fully drawn and every transcript line is fully shown
    expect(await page.locator('#speech-recognition .sp-route').evaluate(e => getComputedStyle(e).strokeDashoffset)).toBe('0px')
    for (const l of ['sp-l1', 'sp-l2', 'sp-l3']) {
      const st = await page.locator(`#speech-recognition .${l}`).evaluate(e => ({ o: getComputedStyle(e).opacity, c: getComputedStyle(e).clipPath }))
      expect(st.o).toBe('1'); expect(st.c).toBe('none')
    }
  })

  test('the speech illustration tells the story: speaker, audio route, transcript', async ({ page }) => {
    await page.goto('/')
    const svg = page.locator('#speech-recognition').getByRole('img', { name: /railway speech-recognition pipeline/ })
    await expect(svg).toContainText('noisy audio')
    await expect(svg).toContainText('transcript')
    await expect(svg).toContainText('error rates not measured yet')
  })
})

test.describe('case studies', () => {
  test('every project has a closed case study with all five parts', async ({ page }) => {
    await page.goto('/')
    for (const id of ALL) {
      await openCard(page, id)
      const cs = page.locator(`#${id}-case`)
      await expect(cs).not.toHaveAttribute('open', '')
      await cs.locator('summary').click()
      await expect(cs).toHaveAttribute('open', '')
      for (const h of ['Problem', 'My work', 'Technical implementation', 'Evaluation and evidence', 'Limitations and current status', 'Code and demo']) {
        await expect(cs.getByRole('heading', { level: 4, name: h })).toBeVisible()
      }
      expect(await cs.locator('ol > li').count()).toBeGreaterThanOrEqual(4)
    }
  })

  test('opens and closes from the keyboard, and the summary names the project', async ({ page }) => {
    await page.goto('/')
    await openCard(page, 'knowyourrules')
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
    await expect(cs.getByRole('heading', { name: 'Technical implementation' })).toBeInViewport()
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
    for (const id of ALL) { await openCard(page, id); await page.locator(`#${id}-case summary`).click() }
    const work = await page.locator('#work').innerText()
    expect(work).not.toMatch(/\d+(\.\d+)?\s?%/)                 // no percentages anywhere in Work
    expect(work).not.toMatch(/accuracy of|WER of|precision|recall|F1/i)
    await expect(page.locator('#speech-recognition-case')).toContainText('haven’t been measured yet')
    await expect(page.locator('#knowyourrules-case')).toContainText('Tested on synthetic material, not on legal accuracy')
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
