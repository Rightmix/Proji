import { expect, test, type Page } from '@playwright/test'

async function requireFixtures(page: Page) {
  await page.goto('/menu')
  const empty = page.getByRole('heading', { name: /menu is coming soon/i })
  const card = page.getByRole('article').first()
  await expect(empty.or(card)).toBeVisible()
  test.skip(await empty.isVisible(), 'Catalog is empty in this environment (production default)')
}

test('M-05/M-06 menu lists labelled samples; every price/kcal is marked illustrative', async ({
  page,
}) => {
  await requireFixtures(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Menu')
  await expect(page.getByRole('note')).toContainText('Development sample data')
  const cards = page.getByRole('article')
  expect(await cards.count()).toBeGreaterThanOrEqual(1)
  for (const card of await cards.all()) {
    const text = await card.innerText()
    if (/₹|\d+\s*kcal/.test(text))
      await expect(card.getByTestId('illustrative-tag').first()).toBeVisible()
  }
  expect(await page.locator('main').innerText()).not.toMatch(/healthy|cure/i)
})

test('F-04 filters update URL and back button restores', async ({ page }) => {
  await requireFixtures(page)
  const all = await page.getByRole('article').count()
  await page.getByRole('group', { name: 'Base' }).getByText('Millet', { exact: true }).click()
  await expect(page).toHaveURL(/\?base=millet$/)
  await expect(page.getByRole('article')).toHaveCount(3) // millet samples
  await page.goBack()
  await expect(page).toHaveURL(/\/menu$/)
  await expect(page.getByRole('article')).toHaveCount(all)
})

test('A-02 filters are keyboard operable', async ({ page }) => {
  await requireFixtures(page)
  const allBase = page.getByRole('group', { name: 'Base' }).getByRole('radio', { name: 'All' })
  await allBase.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/\?base=/)
  const avail = page.getByRole('checkbox', { name: /available now only/i })
  await avail.focus()
  await page.keyboard.press('Space')
  await expect(page).toHaveURL(/available=1/)
})

test('P-01/P-05 detail page works on direct navigation and from a card', async ({ page }) => {
  await requireFixtures(page)
  await page.getByRole('link', { name: 'Kerala Pepper Chicken Kanji' }).click()
  await expect(page).toHaveURL(/\/menu\/kerala-pepper-chicken-kanji$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kerala Pepper Chicken Kanji')
  await expect(page.getByText('Pending validation')).toHaveCount(3)
  await expect(page.getByRole('link', { name: /customi[sz]e this bowl/i })).toHaveAttribute(
    'href',
    '/build?bowl=kerala-pepper-chicken-kanji',
  )
})

test('P-03 unknown bowl shows not found', async ({ page }) => {
  const res = await page.goto('/menu/no-such-bowl')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/bowl not found|menu/i)
})

test('M-07 image fallback: broken image keeps layout and label', async ({ page }) => {
  await page.route('**/assets/home/hero-bowl.webp', (r) => r.abort())
  await requireFixtures(page)
  const card = page.getByRole('article').filter({ hasText: 'Kerala Pepper Chicken Kanji' })
  await expect(card.getByRole('img', { name: /congee/i })).toBeVisible()
  const box = await card.boundingBox()
  expect(box!.height).toBeGreaterThan(200)
})

test.describe('A-03 responsive', () => {
  for (const width of [320, 360, 768, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of [
        '/menu',
        '/menu?protein=fish',
        '/menu/coconut-fish-millet-kanji',
        '/menu/nope',
      ]) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, path).toBeLessThanOrEqual(0)
      }
    })
  }

  test('filter chips meet 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await requireFixtures(page)
    const chips = page.getByRole('search').locator('label')
    const n = await chips.count()
    expect(n).toBeGreaterThan(2)
    for (let i = 0; i < n; i++)
      expect((await chips.nth(i).boundingBox())!.height).toBeGreaterThanOrEqual(44)
  })
})
