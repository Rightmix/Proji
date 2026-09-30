import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/menu',
  '/menu?base=millet&available=1',
  '/menu/kerala-pepper-chicken-kanji',
  '/menu/tandoori-paneer-red-rice-kanji',
  '/menu/does-not-exist',
  '/build',
  '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce,spicy-chilli-oil&toppings=roasted-peanuts,crispy-shallots,fresh-herbs',
  '/login',
  '/unauthorized',
  '/no-such-page',
]

for (const path of routes) {
  test(`A-01 axe: ${path} has no serious/critical violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    ).toEqual([])
  })
}

test('A-01 axe: mobile menu open state', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(
    results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([])
})

test('A-01 axe: builder dialogs and limit state', async ({ page }) => {
  await page.goto(
    '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&toppings=roasted-peanuts,crispy-shallots,fresh-herbs',
  )
  await page.getByRole('tab', { name: /topping/i }).click()
  const check = async () => {
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      r.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => v.id),
    ).toEqual([])
  }
  await check()
  await page.getByRole('button', { name: 'View Nutrition' }).click()
  await check()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /add to cart/i }).click()
  await check()
})
