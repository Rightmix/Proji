import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/menu', '/build', '/login', '/unauthorized', '/no-such-page']

test.describe('N-04 no horizontal overflow', () => {
  for (const width of [320, 360, 390, 768, 1280]) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of publicRoutes) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0)
      }
    })
  }
})

// Stage 5.5: the approved design replaces the mobile sticky header + hamburger with a
// persistent bottom navigation; these tests verify the new navigation instead.
test('N-03 bottom navigation stays visible after scrolling (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo(0, 1500))
      return page.evaluate(() => window.scrollY)
    })
    .toBeGreaterThan(300)
  const nav = page.getByRole('navigation', { name: 'Primary' })
  await expect(nav).toBeInViewport()
  const box = await nav.boundingBox()
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(699)
})

test('N-01 bottom nav: 4 destinations, 44px targets, active state, navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Primary' })
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Build', 'Cart', 'Account'])
  for (const l of await nav.getByRole('link').all())
    expect((await l.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: /^Cart/ }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await expect(nav.getByRole('link', { name: /^Cart/ })).toHaveAttribute('aria-current', 'page')
  // chat button sits above the nav, never on top of it
  const fab = await page.getByRole('button', { name: /chat with proji support/i }).boundingBox()
  const navBox = await nav.boundingBox()
  expect(fab!.y + fab!.height).toBeLessThanOrEqual(navBox!.y)
})

test('desktop uses the top navigation instead of the bottom bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()
})

test('N-05 skip link moves focus to main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#main')).toBeFocused()
})

test('A-02 keyboard focus is visible', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const s = getComputedStyle(el)
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) }
  })
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThanOrEqual(2)
})

test.describe('A-03 reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('transitions collapse', async ({ page }) => {
    await page.goto('/')
    const dur = await page
      .getByRole('link', { name: /build your own/i })
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))
    expect(dur).toBeLessThan(0.02)
  })
})

test('A-03 default motion keeps transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const dur = await page
    .getByRole('link', { name: /build your own/i })
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))
  expect(dur).toBeGreaterThan(0.1)
})

test('T-03 fonts are self-hosted; no third-party requests', async ({ page, baseURL }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url())
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(external).toEqual([])
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
  })
  expect(loaded.join(',')).toMatch(/Inter Variable/)
  expect(loaded.join(',')).toMatch(/Fraunces Variable/)
})

test('H-03 hero image loads with intrinsic size', async ({ page }) => {
  await page.goto('/')
  const img = page.getByRole('img', { name: /congee/i })
  await expect(img).toBeVisible()
  expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBe(960)
})
