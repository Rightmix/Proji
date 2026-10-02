import { expect, test, type Page } from '@playwright/test'

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

test.describe('Stage 5.5 responsive targets', () => {
  for (const vp of [
    { width: 390, height: 844 },
    { width: 393, height: 852 },
    { width: 430, height: 932 },
    { width: 360, height: 640 },
    { width: 320, height: 640 },
  ]) {
    test(`no horizontal overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp)
      for (const p of [
        '/',
        '/categories/all',
        '/categories/high-protein',
        '/menu/grilled-fish-millet-bowl',
        '/build?base=millet-kanji&protein=boiled-egg',
        '/cart',
        '/checkout',
        '/checkout/confirmation',
        '/favourites',
      ]) {
        await page.goto(p)
        await page.waitForLoadState('networkidle')
        expect(await overflow(page), `${p} @ ${vp.width}`).toBeLessThanOrEqual(0)
      }
    })
  }
})

test('home and category use 2 meal cards per row on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const p of ['/', '/categories/all']) {
    await page.goto(p)
    const cards = page.getByTestId('meal-grid').first().getByRole('article')
    await expect(cards.first()).toBeVisible()
    const [a, b, c] = await Promise.all([0, 1, 2].map((i) => cards.nth(i).boundingBox()))
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2) // side by side
    expect(c!.y).toBeGreaterThan(a!.y + a!.height - 1) // third wraps
    expect(a!.width).toBeLessThan(200)
  }
})

test('BYO grid: 3 tiles per row at 390px, 2 per row at 320px', async ({ page }) => {
  for (const [w, cols] of [
    [390, 3],
    [360, 3],
    [320, 2],
  ] as const) {
    await page.setViewportSize({ width: w, height: 800 })
    await page.goto('/build')
    const tiles = page.getByTestId('ingredient-tile')
    const ys = await tiles.evaluateAll((els) =>
      els.slice(0, 3).map((e) => Math.round(e.getBoundingClientRect().y)),
    )
    const firstRow = ys.filter((y) => y === ys[0]).length
    expect(firstRow, `${w}px`).toBe(cols)
    for (const t of await tiles.all())
      expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
})

test('back navigation preserves BYO work and category filters', async ({ page }) => {
  await page.goto('/categories/all?protein=fish')
  await page.getByRole('link', { name: 'Grilled Fish Millet Bowl' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Grilled Fish Millet Bowl')
  await page.getByRole('main').getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/categories\/all\?protein=fish$/)
  await expect(page.getByRole('radio', { name: 'Fish' })).toBeChecked()

  await page.goto('/build')
  await page.getByText('Red Rice Kanji', { exact: true }).click()
  await page.getByRole('button', { name: 'Next: Protein' }).click()
  await page.getByText('Boiled Egg', { exact: true }).click()
  await page.goto('/cart')
  await page.goBack()
  await expect(page.getByRole('radio', { name: /boiled egg/i })).toBeChecked()
  await expect(page.getByTestId('live-price')).toContainText('₹170')
})

test('BYO live nutrition + price on every change; keyboard rail', async ({ page }) => {
  await page.goto('/build')
  await page.getByRole('radio', { name: /brown rice kanji/i }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('live-price')).toContainText('₹120')
  await expect(page.getByRole('group', { name: '220 Kcal' })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('live-price')).toContainText('₹130')
  await page.getByRole('tab', { name: /base/i }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('tab', { name: /protein/i })).toBeFocused()
  await expect(page.getByText('Choose Your Protein')).toBeVisible()
})

test('meal → cart → checkout boundary never creates an order', async ({ page }) => {
  const writes: string[] = []
  page.on('request', (r) => r.method() !== 'GET' && writes.push(r.url()))
  await page.goto('/categories/all')
  await page.getByRole('button', { name: 'Add Grilled Fish Millet Bowl to cart' }).click()
  // bottom nav on mobile, top header on desktop
  await page.getByRole('link', { name: /^Cart/ }).filter({ visible: true }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Cart (1)')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Cart (1)') // persists on device
  await page.getByRole('link', { name: /proceed to checkout/i }).click()
  await expect(page.getByRole('button', { name: 'Continue to Payment' })).toBeDisabled()
  await page.getByRole('link', { name: /preview the order confirmation screen/i }).click()
  await expect(page.getByRole('alert')).toContainText('Design preview only')
  expect(writes).toEqual([])
})

test('account hub (signed in) and back arrows on subpages', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('hub@proji.test')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByText('Signed in as hub@proji.test')).toBeVisible()
  await page.getByRole('link', { name: /^Addresses/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Addresses')
  await page.getByRole('main').getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/account$/)
})

test.describe('reduced motion on new screens', () => {
  test.use({ reducedMotion: 'reduce' })
  test('meal card previews render settled layers without animation', async ({ page }) => {
    await page.goto('/categories/all')
    const layer = page.getByTestId('meal-grid').locator('[data-testid="bowl-layer"]').first()
    await expect(layer).toHaveAttribute('data-phase', 'settled')
    expect(await layer.evaluate((e) => getComputedStyle(e).animationName)).toBe('none')
  })
})
