import { expect, test } from '@playwright/test'

test.describe('Lab · RAG, step by step', () => {
  test('starts at Ingest with real corpus figures, and steps forward and back', async ({ page }) => {
    await page.goto('/')
    const rag = page.locator('#lab-rag')
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Ingest')
    await expect(rag).toContainText(/11 documents · [\d,]+ words/)
    await expect(rag.getByRole('button', { name: 'Back' })).toBeDisabled()
    await rag.getByRole('button', { name: 'Next stage' }).click()
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Chunk')
    await rag.getByRole('button', { name: 'Back' }).click()
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Ingest')
  })

  test('chunk size changes the number of chunks', async ({ page }) => {
    await page.goto('/')
    const rag = page.locator('#lab-rag')
    await rag.getByRole('button', { name: /02\s*Chunk/ }).click()
    const count = async () => Number((await rag.getByText(/\d+ chunks · first three/).textContent())!.match(/\d+/)![0])
    const at60 = await count()
    await rag.locator('label', { hasText: 'up to 40 words' }).click()
    expect(await count()).toBeGreaterThan(at60)
  })

  test('asking retrieves ranked chunks and answers from a real sentence of this site', async ({ page }) => {
    await page.goto('/')
    const rag = page.locator('#lab-rag')
    await rag.getByRole('button', { name: 'Ask', exact: true }).click()
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Retrieve')
    await expect(rag.getByText(/cosine 0\.\d{3}/).first()).toBeVisible()
    await rag.getByRole('button', { name: /05\s*Select context/ }).click()
    await expect(rag.locator('pre')).toContainText('Answer only from the context below')
    await expect(rag.locator('pre')).toContainText('[Source: Railway speech recognition')
    await rag.getByRole('button', { name: 'Next stage' }).click()
    await expect(rag).toContainText('extractive, not generated')
    await expect(rag.locator('blockquote')).toContainText('benchmarked Indic-Conformer, Qwen3-ASR and Whisper')
  })

  test('an off-topic question is not covered, and an empty one is an error', async ({ page }) => {
    await page.goto('/')
    const rag = page.locator('#lab-rag')
    await rag.getByRole('button', { name: 'What is the capital of France?' }).click()
    await expect(rag).toContainText('No chunk shares a word with this question')
    await rag.getByRole('button', { name: /06\s*Answer/ }).click()
    await expect(rag).toContainText('The context doesn’t cover this question')
    await rag.getByRole('textbox', { name: 'Question' }).fill('')
    await rag.getByRole('button', { name: 'Ask', exact: true }).click()
    await expect(rag.getByRole('alert')).toContainText('Type a question first')
    await expect(rag.getByRole('textbox', { name: 'Question' })).toHaveAttribute('aria-invalid', 'true')
  })

  test('reset returns to the starting state; works from the keyboard', async ({ page }) => {
    await page.goto('/')
    const rag = page.locator('#lab-rag')
    await rag.getByRole('textbox', { name: 'Question' }).fill('Where did Jayanth work as a Data Developer?')
    await rag.getByRole('textbox', { name: 'Question' }).press('Enter')
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Retrieve')
    await rag.getByRole('button', { name: 'Reset' }).focus()
    await page.keyboard.press('Enter')
    await expect(rag.getByRole('heading', { level: 4 })).toContainText('Ingest')
    await expect(rag.getByRole('textbox', { name: 'Question' })).toHaveValue('Which models were benchmarked?')
  })
})

test.describe('Lab · zone check', () => {
  test('is labelled a synthetic scene, with no detector', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#lab-zone')).toContainText('No camera and no detector run here')
  })

  test('stepping along “walk through” logs entering and leaving, and the rule explains each verdict', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('#lab-zone')
    const status = zone.locator('[aria-live]').first()
    await expect(status).toContainText('clear')
    await expect(zone).toContainText(/even → outside/)
    const step = zone.getByRole('button', { name: 'Step', exact: true })
    for (let i = 0; i < 25; i++) await step.click()
    await expect(status).toContainText('intrusion')
    await expect(zone).toContainText(/1 edge crossed → odd → inside/)
    await expect(zone).toContainText(/frame \d+ · entered the zone/)
    await zone.getByLabel(/Frame/).fill('48')
    await expect(status).toContainText('clear')
    await expect(zone).toContainText(/frame 48 · left the zone/)
  })

  test('“walk past” never enters the zone', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('#lab-zone')
    await zone.locator('label', { hasText: 'Walk past' }).click()
    for (const f of ['0', '12', '24', '36', '48']) {
      await zone.getByLabel(/Frame/).fill(f)
      await expect(zone.locator('[aria-live]').first()).toContainText('clear')
    }
    await expect(zone).toContainText('No events yet')
  })

  test('play runs to the end; reset restores the start', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('#lab-zone')
    await zone.locator('label', { hasText: 'Stop inside' }).click()
    await zone.getByRole('button', { name: 'Play' }).click()
    await expect(zone.getByRole('button', { name: 'Replay' })).toBeVisible({ timeout: 10_000 })
    await expect(zone.locator('[aria-live]').first()).toContainText('intrusion')
    await zone.getByRole('button', { name: 'Reset' }).click()
    await expect(zone.locator('[aria-live]').first()).toContainText('clear')
    await expect(zone).toContainText('No events yet')
  })

  test('the keyboard moves the person into the zone', async ({ page }) => {
    await page.goto('/')
    const zone = page.locator('#lab-zone')
    await zone.getByRole('button', { name: /^Person/ }).focus()
    for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowRight')
    await expect(zone.getByRole('button', { name: /^Person/ })).toHaveAttribute('aria-label', /Inside the zone/)
    await expect(zone).toContainText('moved by hand · entered the zone')
  })
})

test.describe('Lab · token playground', () => {
  test('before loading it shows characters and words only, labelled as not tokens', async ({ page }) => {
    await page.goto('/')
    const tok = page.locator('#lab-tokens')
    await expect(tok).toContainText('(not tokens)')
    await expect(tok.getByRole('button', { name: 'Load tokenizers' })).toBeVisible()
    await expect(tok).not.toContainText(/\d+\s+tokens/)
  })

  test('loads the real tokenizers on request and counts with both', async ({ page }) => {
    const vocab: string[] = []
    page.on('request', r => { if (/(o200k_base|cl100k_base|GptEncoding)-/.test(r.url())) vocab.push(r.url()) })
    await page.goto('/')
    const tok = page.locator('#lab-tokens')
    // Scrolling the whole page, the Lab included, downloads nothing from the tokenizers.
    for (let y = 0; y < 16000; y += 1200) await page.mouse.wheel(0, 1200)
    await tok.scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')
    expect(vocab).toEqual([])
    await tok.getByRole('button', { name: 'Load tokenizers' }).click()
    await expect(tok.getByText('o200k_base', { exact: false }).first()).toBeVisible()
    expect(vocab.length).toBeGreaterThanOrEqual(2)   // the click is what fetched them
    await tok.getByRole('button', { name: 'Hindi' }).click()
    const count = async (name: string) => Number(await tok.locator('dl > div', { hasText: name }).locator('dd span').first().textContent())
    const o = await count('o200k_base')
    const c = await count('cl100k_base')
    expect(o).toBeGreaterThan(0)
    expect(o).toBeLessThan(c)
    await expect(tok.getByRole('list', { name: /tokens from o200k_base/ }).getByRole('listitem')).toHaveCount(o)
    await tok.getByLabel('token IDs').check()
    await expect(tok.getByRole('list', { name: /tokens from/ }).getByRole('listitem').first()).toContainText(/\d+/)
  })

  test('an empty text has a clear empty state; reset restores the example', async ({ page }) => {
    await page.goto('/')
    const tok = page.locator('#lab-tokens')
    await tok.getByRole('button', { name: 'Load tokenizers' }).click()
    await tok.getByLabel('Text').fill('')
    await expect(tok).toContainText('Type something above, or pick an example')
    await tok.getByRole('button', { name: 'Reset' }).click()
    await expect(tok.getByLabel('Text')).toHaveValue('Tokenizers split text into pieces a model has seen before.')
  })

  test('a failed download shows an error, and Retry recovers', async ({ page }) => {
    let block = true
    await page.route(/(o200k_base|cl100k_base)-.*\.js$/, route => (block ? route.abort() : route.continue()))
    await page.goto('/')
    const tok = page.locator('#lab-tokens')
    await tok.getByRole('button', { name: 'Load tokenizers' }).click()
    await expect(tok.getByRole('alert')).toContainText('Couldn’t load the tokenizers')
    block = false
    await tok.getByRole('button', { name: 'Retry' }).click()
    // Chromium keeps a failed dynamic import for the page's lifetime, so Retry may fail again; the
    // panel then offers a reload, which recovers.
    const counts = tok.locator('dl')
    const reload = tok.getByRole('button', { name: 'Reload page' })
    await expect(counts.or(reload)).toBeVisible()
    if (await reload.isVisible()) {
      await reload.click()
      await page.locator('#lab-tokens').getByRole('button', { name: 'Load tokenizers' }).click()
    }
    await expect(page.locator('#lab-tokens dl')).toBeVisible()
  })
})
