import { expect, test } from '@playwright/test'

const publicRoutes: [string, RegExp][] = [
  ['/', /^PROJI$/],
  ['/menu', /^Menu$/],
  ['/build', /Build your bowl/],
  ['/login', /Sign in/],
  ['/unauthorized', /Access denied/],
  ['/no-such-page', /Page not found/],
]

for (const [path, heading] of publicRoutes) {
  test(`direct navigation to ${path} renders`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
  })
}

for (const path of ['/account', '/admin', '/kitchen']) {
  test(`${path} redirects anonymous visitors to login`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in')
  })
}

test('no service_role key in shipped bundle', async ({ page }) => {
  const scripts: string[] = []
  page.on('response', async (r) => {
    if (r.url().endsWith('.js')) scripts.push(await r.text())
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  for (const s of scripts) expect(s).not.toMatch(/service_role|SUPABASE_SERVICE/)
})
