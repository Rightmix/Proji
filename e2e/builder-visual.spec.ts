import { expect, test } from '@playwright/test'

// P-15 visual regression of the four approved master states (mobile, reduced motion for determinism).
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
test.beforeEach(({ browserName }, info) => {
  test.skip(info.project.name !== 'mobile' || browserName !== 'chromium', 'mobile baseline only')
})

const states: [string, string, RegExp][] = [
  ['1-base', '/build?base=brown-rice-kanji', /base/i],
  ['2-protein', '/build?base=brown-rice-kanji&protein=kerala-grilled-fish', /protein/i],
  [
    '3-flavour',
    '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce',
    /flavour/i,
  ],
  [
    '4-topping',
    '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce&toppings=roasted-peanuts,crispy-shallots',
    /topping/i,
  ],
]

test('empty bowl state', async ({ page }) => {
  await page.goto('/build')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('builder-0-empty.png', { maxDiffPixelRatio: 0.02 })
})

for (const [name, url, tab] of states) {
  test(`master state ${name}`, async ({ page }) => {
    await page.goto(url)
    await page.getByRole('tab', { name: tab }).click()
    await expect(
      page.locator('[data-testid="bowl-layer"]:not([data-phase="settled"])'),
    ).toHaveCount(0)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`builder-${name}.png`, { maxDiffPixelRatio: 0.02 })
  })
}
