import { expect, test } from '@playwright/test'
import { scrollToMiddle, setPrefs } from './helpers'

test.describe('command menu', () => {
  test('opens with Ctrl+K and "/", filters, and Enter goes to the result and focuses it', async ({ page }) => {
    await page.goto('/')
    const dialog = page.getByRole('dialog', { name: 'Command menu' })
    await page.keyboard.press('Control+k')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('combobox')).toBeFocused()
    await page.keyboard.type('zone check')
    await expect(page.getByRole('option')).toHaveText(['Try the zone check'])
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(page.locator('#lab-zone')).toBeFocused()

    await page.keyboard.press('/')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('arrow keys move the selection and wrap around', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const selected = page.locator('[role=option][aria-selected=true]')
    await expect(selected).toHaveText('Home')
    await page.keyboard.press('ArrowDown')
    await expect(selected).toHaveText('Selected work')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(selected).toContainText('Ez-Learn live demo')
  })

  test('preferences run without closing the menu', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('light')
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible()
  })
})

test.describe('preferences', () => {
  test('dark by default; the theme button switches and the choice survives a reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('a saved theme is applied before the app script runs (no flash)', async ({ page }) => {
    await setPrefs(page, { theme: 'light', accent: 'rose' })
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        ;(window as unknown as { __early: string }).__early = `${document.documentElement.dataset.theme}/${document.documentElement.dataset.accent}`
      })
    })
    await page.goto('/')
    expect(await page.evaluate(() => (window as unknown as { __early: string }).__early)).toBe('light/rose')
  })

  test('the larger-text button is a toggle that persists', async ({ page }) => {
    await page.goto('/')
    const aa = page.getByRole('button', { name: 'Larger text' })
    await expect(aa).toHaveAttribute('aria-pressed', 'false')
    await aa.click()
    await expect(aa).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-text', 'lg')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-text', 'lg')
  })

  test('larger text scales body copy, headings, Lab inputs and controls alike', async ({ page }) => {
    // (The very large fluid display type, like the hero name, follows the window size instead.)
    await page.goto('/')
    const sels = ['#journey li[data-i="1"] ul li', '#journey li[data-i="1"] h3', '#lab-rag input', '#lab-tokens textarea', '#lab-rag button[type=submit]', 'header nav a', '#design-tokens summary']
    const sizes = () => page.evaluate(ss => ss.map(s => parseFloat(getComputedStyle(document.querySelector(s)!).fontSize)), sels)
    const before = await sizes()
    await page.getByRole('button', { name: 'Larger text' }).click()
    const after = await sizes()
    sels.forEach((s, i) => expect(after[i] / before[i], s).toBeCloseTo(1.125, 2))
  })

  test('design tokens (footer) restyle the page and reset', async ({ page }) => {
    await page.goto('/')
    const panel = page.locator('#design-tokens')
    await panel.locator('summary').click()
    await panel.locator('label', { hasText: 'Ember' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'ember')
    await panel.locator('label', { hasText: 'Square' }).click()
    expect(await page.locator('#lab-rag').evaluate(e => getComputedStyle(e).borderTopLeftRadius)).toBe('0px')
    await panel.getByRole('button', { name: 'Reset' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'cobalt')
    await expect(page.locator('html')).toHaveAttribute('data-radius', 'soft')
  })

  test('headings are always Bricolage: no font choice, and an old saved one is ignored', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('prefs', JSON.stringify({ type: 'mono', accent: 'moss' })))
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'moss')
    await expect(page.locator('html')).not.toHaveAttribute('data-type', /.*/)
    for (const sel of ['#hero-title .t-display', '#hero-title .t-headline', '#work-title', '#knowyourrules h3', '#contact-title']) {
      const font = await page.locator(sel).first().evaluate(el => getComputedStyle(el).fontFamily)
      expect(font).toMatch(/^"?Bricolage Grotesque Variable/)
    }
    const panel = page.locator('#design-tokens')
    await panel.locator('summary').click()
    await expect(panel.getByRole('group')).toHaveCount(3)   // colour, spacing, radius
    await expect(panel).not.toContainText(/Grotesk|Heading type/)
    await page.keyboard.press('Control+k')
    await page.keyboard.type('heading')
    await expect(page.getByRole('dialog', { name: 'Command menu' }).getByRole('option')).toHaveCount(0)
  })

  test('design tokens from the command menu', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('accent: moss')
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'moss')
    const menu = page.getByRole('dialog', { name: 'Command menu' })
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await page.keyboard.press('Control+k')
    await expect(menu.getByRole('combobox')).toHaveValue('')
    await page.keyboard.type('open design tokens')
    await page.keyboard.press('Enter')
    await expect(page.locator('#design-tokens')).toHaveAttribute('open', '')
  })
})

test.describe('lab', () => {
  test('zone check: dragging a corner with the pointer moves it', async ({ page }) => {
    await page.goto('/')
    const corner = page.locator('#lab-zone').getByRole('button', { name: /^Zone corner 1/ })
    await corner.scrollIntoViewIfNeeded()
    const box = (await corner.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x - 40, box.y + 30, { steps: 5 })
    await page.mouse.up()
    await expect(corner).not.toHaveAttribute('aria-label', 'Zone corner 1 of 4, at 205, 95')
  })
})

test.describe('navigation', () => {
  test('the journey illustration follows the chapter being read', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const step = page.locator('#journey [aria-current=step]').filter({ visible: true })
    await scrollToMiddle(page, '#journey li[data-i="4"]')
    await expect(step).toContainText('Retrieval')
    await scrollToMiddle(page, '#journey li[data-i="2"]')
    await expect(step).toContainText('Processing')
    // Wide screens: the illustration stays pinned beside the chapters.
    await expect(page.locator('#journey figure')).toBeInViewport()
  })

  for (const [width, height] of [[375, 667], [320, 568]]) {
    test(`journey on a ${width}px phone: only a slim station strip stays pinned`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await scrollToMiddle(page, '#journey li[data-i="4"]')
      // The illustration has scrolled away instead of covering the chapters.
      await expect(page.locator('#journey figure')).not.toBeInViewport()
      const strip = page.getByRole('list', { name: 'Stations' })
      await expect(strip).toHaveCount(1)   // one copy in the accessibility tree at a time
      await expect(strip).toBeInViewport()
      await expect(strip.locator('[aria-current=step]')).toContainText('Retrieval')
      const box = (await strip.boundingBox())!
      expect(box.height).toBeLessThan(height * 0.1)
      // The chapter being read is not hidden under the top bar or the strip.
      const heading = page.locator('#journey li[data-i="4"] h3')
      expect((await heading.boundingBox())!.y).toBeGreaterThan(box.y + box.height)
      await expect(heading).toBeInViewport()
    })
  }

  test('the top bar marks the section being read', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('lab')!.offsetTop, behavior: 'instant' }))
    await expect(page.locator('nav[aria-label=Sections] [aria-current=location]')).toContainText('lab')
  })

  for (const vp of [{ width: 1280, height: 800 }, { width: 375, height: 667 }]) {
    test(`deep links land on their target on first load (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize(vp)
      const current = page.locator('nav[aria-label=Sections] [aria-current=location]')
      for (const [hash, nav] of [['journey', 'journey'], ['lab-tokens', 'lab'], ['about', 'about'], ['knowyourrules-case', 'work']]) {
        await page.goto('about:blank')   // a fresh load each time, not an in-page hash change
        await page.goto(`/#${hash}`)
        const top = await page.locator(`#${hash}`).evaluate(el => el.getBoundingClientRect().top)
        const header = await page.locator('header').first().evaluate(el => el.getBoundingClientRect().height)
        expect(top, hash).toBeGreaterThanOrEqual(header - 1)   // not hidden under the top bar
        expect(top, hash).toBeLessThan(header + 60)            // and right at the top, not further down
        await expect(current, hash).toContainText(nav)
      }
      // A <details> target opens.
      await page.goto('about:blank')
      await page.goto('/#design-tokens')
      await expect(page.locator('#design-tokens')).toHaveAttribute('open', '')
      await expect(page.locator('#design-tokens')).toBeInViewport()
    })
  }

  test('after a nav click, other ways of moving still update the highlight', async ({ page }) => {
    await page.goto('/')
    const current = page.locator('nav[aria-label=Sections] [aria-current=location]')
    await page.locator('nav[aria-label=Sections] a[href="#about"]').click()
    await expect(current).toContainText('about')
    // the command menu
    await page.keyboard.press('Control+k')
    await page.keyboard.type('journey')
    await page.keyboard.press('Enter')
    await expect(current).toContainText('journey')
    // an in-page link outside the nav
    await page.locator('nav[aria-label=Sections] a[href="#contact"]').click()
    await expect(current).toContainText('contact')
    await page.locator('#knowyourrules a[href="#lab-rag"]').click()
    await expect(current).toContainText('lab')
  })

  test('copy from the command menu reports a failure instead of crashing without the Clipboard API', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }))
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('copy email')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Command menu' })).toContainText('Couldn’t copy. The address is vukkisajayanth@gmail.com')
    expect(errors).toEqual([])
  })

  test('copy email shows a confirmation', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await page.getByRole('button', { name: 'Copy email address' }).click()
    await expect(page.locator('#contact [aria-live]')).toContainText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('vukkisajayanth@gmail.com')
  })

  test('journey keeps the career content that is shown today', async ({ page }) => {
    await page.goto('/')
    const journey = page.locator('#journey')
    for (const text of ['Data Developer', 'Kenan billing migration of 2M+ customer records', 'improving processing speed by 25%',
      'cutting manual validation time by 40%', 'Star of the Month', 'Associate Data Scientist (internship)', 'AiSpry · Oct 2026 – Dec 2026',
      'PG Program in AI & Data Science', 'B.Tech, Computer Science & Engineering']) {
      await expect(journey).toContainText(text)
    }
    await expect(page.getByText('Associate Data Scientist intern at AiSpry').first()).toBeVisible()
  })
})
