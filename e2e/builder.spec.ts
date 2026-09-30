import { expect, test, type Page } from '@playwright/test'

const layerIds = (page: Page) =>
  page
    .locator('[data-testid="bowl-layer"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.ingredient))

async function pickMaster(page: Page) {
  await page.getByText('Brown Rice Kanji', { exact: true }).click()
  await page.getByRole('button', { name: /^next/i }).click()
  await page.getByText('Kerala Grilled Fish', { exact: true }).click()
  await page.getByRole('button', { name: /^next/i }).click()
  await page.getByText('Kerala Coconut Sauce', { exact: true }).click()
  await page.getByRole('button', { name: /^next/i }).click()
  await page.getByText('Roasted Peanuts', { exact: true }).click()
  await page.getByText('Crispy Shallots', { exact: true }).click()
}

test('P-01 direct navigation renders the empty bowl', async ({ page }) => {
  const res = await page.goto('/build')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Customize')
  await expect(page.getByText(/your bowl builds here/i)).toBeVisible()
  await expect(page.getByTestId('live-price')).toContainText('₹0')
  await expect(page.getByTestId('prototype-notice')).toBeVisible()
})

test('P-02 master journey: bowl layers, price and macros', async ({ page }) => {
  await page.goto('/build')
  await pickMaster(page)
  await expect(page.getByTestId('live-price')).toContainText('₹340')
  await expect
    .poll(() => layerIds(page))
    .toEqual([
      'base.brown-rice-kanji',
      'protein.kerala-grilled-fish',
      'flavour.kerala-coconut-sauce',
      'topping.roasted-peanuts',
      'topping.crispy-shallots',
    ])
  await expect(page.locator('[data-testid="bowl-layer"][data-phase="settled"]')).toHaveCount(5, {
    timeout: 5000,
  })
  await expect(page.getByRole('button', { name: /add to cart/i })).toContainText('₹340')
})

test('P-12/R-05 rapid switching with slow assets ends in the correct final state', async ({
  page,
}) => {
  await page.route('**/assets/bowl-builder/**', async (route) => {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))
    await route.continue()
  })
  await page.goto('/build')
  for (const name of [
    'Millet Kanji',
    'Red Rice Kanji',
    'Brown Rice Kanji',
    'Millet Kanji',
    'Red Rice Kanji',
  ]) {
    await page.getByText(name, { exact: true }).click()
  }
  await page.getByRole('button', { name: /^next/i }).click()
  for (const name of [
    'Pepper Chicken',
    'Boiled Egg',
    'Roasted Soya Chunks',
    'Kerala Grilled Fish',
    'Boiled Egg',
  ]) {
    await page.getByText(name, { exact: true }).click()
  }
  await page.getByRole('button', { name: /^next/i }).click()
  for (const name of ['Garlic Tadka', 'Herb Mint Sauce', 'Garlic Tadka', 'Spicy Chilli Oil']) {
    await page.getByText(name, { exact: true }).click()
  }
  await expect
    .poll(() => layerIds(page))
    .toEqual([
      'base.red-rice-kanji',
      'protein.boiled-egg',
      'flavour.spicy-chilli-oil',
      'flavour.herb-mint-sauce',
    ])
  await expect(page.locator('[data-testid="bowl-layer"][data-phase="settled"]')).toHaveCount(4, {
    timeout: 8000,
  })
  await expect(page.locator('[data-testid="bowl-layer"] img')).toHaveCount(4)
})

test('P-04 limit messaging for toppings', async ({ page }) => {
  await page.goto('/build?base=millet-kanji&protein=boiled-egg')
  await page.getByRole('tab', { name: /topping/i }).click()
  for (const n of ['Roasted Peanuts', 'Crispy Shallots', 'Fresh Herbs'])
    await page.getByText(n, { exact: true }).click()
  await expect(page.getByText(/maximum of 3 toppings/i)).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /pickled vegetables/i })).toBeDisabled()
})

test('P-03 keyboard: tabs with arrows, cards with Space, dialogs with Escape', async ({ page }) => {
  await page.goto('/build')
  const firstBase = page.getByRole('radio', { name: /brown rice kanji/i })
  await firstBase.focus()
  await page.keyboard.press('Space')
  await expect(firstBase).toBeChecked()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: /millet kanji/i })).toBeChecked()
  await page.getByRole('tab', { name: /base/i }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /protein/i })).toBeFocused()
  await expect(page.getByRole('tab', { name: /protein/i })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'View Nutrition' }).click()
  await expect(page.getByRole('dialog', { name: 'Nutrition' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('P-06 Add to Cart prototype makes no network order', async ({ page }) => {
  const posts: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET') posts.push(`${r.method()} ${r.url()}`)
  })
  await page.goto(
    '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce',
  )
  await page.getByRole('tab', { name: /topping/i }).click()
  await page.getByRole('button', { name: /add to cart/i }).click()
  const dlg = page.getByRole('dialog', { name: 'Your bowl' })
  await expect(dlg).toContainText('Prototype only')
  await expect(dlg).toContainText('Kerala Coconut Sauce')
  expect(posts).toEqual([])
})

test('P-07 share link restores the bowl', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/build?base=red-rice-kanji&protein=pepper-chicken&toppings=fresh-herbs')
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: undefined }))
  await page.getByRole('button', { name: /share/i }).click()
  await expect(page.getByText('Link copied')).toBeVisible()
  const url = await page.evaluate(() => navigator.clipboard.readText())
  await page.goto(url)
  await expect
    .poll(() => layerIds(page))
    .toEqual(['base.red-rice-kanji', 'protein.pepper-chicken', 'topping.fresh-herbs'])
})

test.describe('P-09 sticky preview and footer', () => {
  for (const vp of [
    { width: 390, height: 844 },
    { width: 360, height: 640 },
  ]) {
    test(`${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/build?base=brown-rice-kanji&protein=kerala-grilled-fish')
      await page.getByRole('tab', { name: /topping/i }).click()
      await page.mouse.wheel(0, 2000)
      await page.waitForTimeout(200)
      const bowl = await page.getByTestId('bowl-renderer').boundingBox()
      expect(bowl!.y).toBeGreaterThanOrEqual(0)
      expect(bowl!.y + bowl!.height).toBeLessThanOrEqual(vp.height)
      await expect(page.getByRole('button', { name: /add to cart/i })).toBeInViewport()
      await expect(page.getByRole('button', { name: 'View Nutrition' })).toBeInViewport()
      // every ingredient card is reachable on short screens
      const last = page.getByRole('checkbox', { name: /pickled vegetables/i })
      await last.scrollIntoViewIfNeeded()
      const box = await page.getByText('Pickled Vegetables', { exact: true }).boundingBox()
      const footer = await page.getByRole('button', { name: /add to cart/i }).boundingBox()
      const preview = await page.getByTestId('sticky-preview').boundingBox()
      expect(box!.y).toBeGreaterThanOrEqual(preview!.y + preview!.height - 1)
      expect(box!.y + box!.height).toBeLessThanOrEqual(footer!.y)
    })
  }
})

test('P-10 no horizontal overflow', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(
      '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce,spicy-chilli-oil&toppings=roasted-peanuts,crispy-shallots,fresh-herbs',
    )
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `${width}px`).toBeLessThanOrEqual(0)
  }
})

test.describe('P-11 reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('layers settle without animating', async ({ page }) => {
    await page.goto('/build')
    await page.getByText('Millet Kanji', { exact: true }).click()
    const layer = page.locator('[data-testid="bowl-layer"]')
    await expect(layer).toHaveAttribute('data-phase', 'settled')
    expect(await layer.evaluate((e) => getComputedStyle(e).animationName)).toBe('none')
  })
})

test('animation runs with motion allowed (base reveal)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/build')
  await page.getByText('Millet Kanji', { exact: true }).click()
  const layer = page.locator('[data-testid="bowl-layer"]')
  await expect(layer).toHaveAttribute('data-phase', 'entering')
  expect(await layer.evaluate((e) => getComputedStyle(e).animationName)).toBe('layer-reveal')
  await expect(layer).toHaveAttribute('data-phase', 'settled')
})

test('R-06 broken asset shows fallback shape', async ({ page }) => {
  await page.route('**/assets/bowl-builder/proteins/**', (r) => r.abort())
  await page.goto('/build?base=brown-rice-kanji&protein=kerala-grilled-fish')
  await expect(page.locator('[data-ingredient="protein.kerala-grilled-fish"]')).toHaveAttribute(
    'data-phase',
    'error',
  )
  await expect(page.getByTestId('layer-fallback')).toBeVisible()
})

test('P-16 performance: progressive asset loading and budget', async ({ page }) => {
  const urls: string[] = []
  page.on('requestfinished', (r) => {
    if (r.url().includes('/assets/bowl-builder/')) urls.push(new URL(r.url()).pathname)
  })
  await page.goto('/build')
  await page.waitForLoadState('networkidle')
  expect(urls.some((u) => u.includes('/flavours/') || u.includes('/toppings/'))).toBe(false)
  // Only the tab icons (first ingredient per category) may load before those steps are visited.
  const earlyThumbs = urls.filter((u) => /thumbnails\/(flavour|topping)\./.test(u))
  expect(earlyThumbs.sort()).toEqual([
    '/assets/bowl-builder/thumbnails/flavour.kerala-coconut-sauce.webp',
    '/assets/bowl-builder/thumbnails/topping.roasted-peanuts.webp',
  ])
  const sizes = await page.evaluate(async () => {
    const res = await fetch('/assets/bowl-builder/bases/brown-rice-kanji.webp')
    return (await res.arrayBuffer()).byteLength
  })
  expect(sizes).toBeLessThan(80_000)
})
