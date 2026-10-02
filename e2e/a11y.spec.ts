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
  '/categories/all',
  '/categories/high-protein',
  '/menu/grilled-fish-millet-bowl',
  '/cart',
  '/checkout',
  '/checkout/confirmation',
  '/favourites',
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

test('A-01 axe: chat dialog open state (Stage 5.5 replaces the mobile menu)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('/')
  await page.getByRole('button', { name: /chat with proji support/i }).click()
  await expect(page.getByRole('dialog', { name: 'Chat with PROJI' })).toBeVisible()
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

test('A-01 axe: account pages and dialogs (signed in)', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('axe@proji.test')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
  const check = async (label: string) => {
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      r.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${label}: ${v.id}`),
    ).toEqual([])
  }
  for (const p of [
    '/account',
    '/account/profile',
    '/account/addresses',
    '/account/addresses/new',
    '/account/preferences',
    '/account/bowls',
    '/account/orders',
  ]) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
    await check(p)
  }
  await page.goto('/account/addresses/new')
  await page.getByRole('button', { name: 'Save address' }).click()
  await check('address form errors')
  await page.goto('/build?base=millet-kanji&protein=boiled-egg')
  await page.getByRole('button', { name: 'Save bowl' }).click()
  await check('save bowl dialog')
  await page.getByLabel('Bowl name').fill('Axe bowl')
  await page.getByRole('dialog').getByRole('button', { name: 'Save bowl' }).click()
  await page.goto('/account/bowls')
  await page.getByRole('button', { name: 'Delete Axe bowl' }).click()
  await check('delete confirmation')
})
