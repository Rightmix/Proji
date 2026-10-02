import { expect, test, type Page } from '@playwright/test'

// Runs against the E2E build (VITE_TEST_AUTH=true): simulated auth + RLS-equivalent in-memory store.
const PASSWORD = 'password123'

async function signIn(page: Page, email = 'alice@proji.test', from = '/account') {
  await page.goto(from)
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click()
}

test('U-01 protected routes redirect and return after sign-in; refresh keeps session', async ({
  page,
}) => {
  await signIn(page, 'alice@proji.test', '/account/addresses')
  await expect(page).toHaveURL(/\/account\/addresses$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Addresses' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Addresses' })).toBeVisible()
})

test('U-02 sign out returns to signed-out state', async ({ page }) => {
  await signIn(page)
  await page.getByRole('main').getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/account/bowls')
  await expect(page).toHaveURL(/\/login$/)
})

test('U-05/U-14 keyboard-only address add, default switch and delete confirmation', async ({
  page,
}) => {
  await signIn(page, 'kb@proji.test', '/account/addresses/new')
  await page.getByLabel(/recipient name/i).focus()
  await page.keyboard.type('Akhil')
  await page.keyboard.press('Tab')
  await page.keyboard.type('+91 98470 12345')
  await page.keyboard.press('Tab') // country select (India)
  await page.keyboard.press('Tab')
  await page.keyboard.type('Flat 4B')
  await page.getByLabel(/city/i).focus()
  await page.keyboard.type('Kozhikode')
  await page.getByLabel(/PIN code/i).focus()
  await page.keyboard.type('673001')
  await page.getByRole('button', { name: 'Save address' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Address added.')).toBeVisible()
  await expect(
    page.getByLabel('Home address', { exact: true }).getByText('Default', { exact: true }),
  ).toBeVisible()

  // second address (Bahrain, work)
  await page.getByRole('link', { name: 'Add address' }).click()
  await page.getByText('Work', { exact: true }).click()
  await page.getByLabel(/recipient name/i).fill('Akhil')
  await page.getByLabel(/^phone/i).fill('+973 3300 1234')
  await page.getByLabel('Country').selectOption('BH')
  await page.getByLabel(/flat \/ house/i).fill('Building 2411')
  await page.getByLabel(/city/i).fill('Manama')
  await page.getByRole('button', { name: 'Save address' }).click()
  await expect(page.getByLabel('Work address', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Make Work the default address' }).click()
  await expect(
    page.getByLabel('Work address', { exact: true }).getByText('Default', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByLabel('Home address', { exact: true }).getByText('Default', { exact: true }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: 'Delete Work address' }).focus()
  await page.keyboard.press('Enter')
  const dlg = page.getByRole('dialog', { name: 'Delete address?' })
  await expect(dlg).toBeVisible()
  await expect(dlg.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dlg).toBeHidden()
  await page.getByRole('button', { name: 'Delete Work address' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete address' }).click()
  await expect(page.getByText('Address deleted.')).toBeVisible()
  await expect(
    page.getByLabel('Home address', { exact: true }).getByText('Default', { exact: true }),
  ).toBeVisible()
})

test('U-06 preferences persist across reload', async ({ page }) => {
  await signIn(page, 'prefs@proji.test', '/account/preferences')
  await page.getByLabel('Medium').check()
  await page.getByLabel(/include cutlery/i).uncheck()
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.getByText('Preferences saved.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Medium')).toBeChecked()
  await expect(page.getByLabel(/include cutlery/i)).not.toBeChecked()
})

test('U-07 save a bowl in /build, list it, reopen it with selections restored', async ({
  page,
}) => {
  await signIn(page, 'bowls@proji.test')
  await page.goto(
    '/build?base=red-rice-kanji&protein=pepper-chicken&flavours=garlic-tadka&toppings=fresh-herbs,crispy-shallots',
  )
  await page.getByRole('button', { name: 'Save bowl' }).click()
  const dlg = page.getByRole('dialog', { name: 'Save bowl' })
  await dlg.getByLabel('Bowl name').fill('Lunch bowl')
  await dlg.getByRole('button', { name: 'Save bowl' }).click()
  await expect(dlg.getByText('“Lunch bowl” is saved to your account.')).toBeVisible()
  await dlg.getByRole('link', { name: 'View saved bowls' }).click()
  await expect(page.getByRole('heading', { name: 'Lunch bowl' })).toBeVisible()
  await page.getByRole('link', { name: 'Open Lunch bowl in the builder' }).click()
  await expect(page.getByText('Opened “Lunch bowl”.')).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('[data-testid="bowl-layer"]')
        .evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.ingredient)),
    )
    .toEqual([
      'base.red-rice-kanji',
      'protein.pepper-chicken',
      'flavour.garlic-tadka',
      'topping.fresh-herbs',
      'topping.crispy-shallots',
    ])
  await expect(page.getByTestId('live-price')).toContainText('₹320') // 130 + 140 + 20 + 10 + 20 (illustrative)
})

test('U-08 signed-out save sends you to login and back to the same bowl', async ({ page }) => {
  await page.goto('/build?base=millet-kanji&protein=boiled-egg')
  await page.getByRole('button', { name: 'Save bowl' }).click()
  await page.getByRole('link', { name: 'Sign in to save' }).click()
  await page.getByLabel('Email').fill('later@proji.test')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/build\?base=millet-kanji&protein=boiled-egg$/)
  await expect(page.getByRole('button', { name: 'Save bowl' })).toBeVisible()
})

test('isolation: a second user cannot see the first user’s data or open their saved bowl', async ({
  page,
}) => {
  await signIn(page, 'owner@proji.test')
  await page.goto('/build?base=millet-kanji&protein=boiled-egg')
  await page.getByRole('button', { name: 'Save bowl' }).click()
  await page.getByLabel('Bowl name').fill('Private')
  await page.getByRole('dialog').getByRole('button', { name: 'Save bowl' }).click()
  await page.getByRole('link', { name: 'View saved bowls' }).click()
  const href = await page
    .getByRole('link', { name: 'Open Private in the builder' })
    .getAttribute('href')
  await page.goto('/account') // Stage 5.5: account hub replaces the Overview pill
  await page.getByRole('main').getByRole('button', { name: 'Sign out' }).click()
  await signIn(page, 'intruder@proji.test', '/account/bowls')
  await expect(page.getByRole('heading', { name: 'No saved bowls yet' })).toBeVisible()
  await page.goto(href!)
  await expect(page.getByText('We couldn’t find that saved bowl.')).toBeVisible()
  await expect(page.locator('[data-testid="bowl-layer"]')).toHaveCount(0)
})

test('U-10 expired session shows sign-in-again', async ({ page }) => {
  await signIn(page, 'exp@proji.test', '/account/bowls')
  await page.evaluate(() => sessionStorage.setItem('proji-test-expired', '1'))
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Your session has expired.')
  await expect(page.getByRole('link', { name: 'Sign in again' })).toBeVisible()
})

test('U-11 order history is an empty boundary', async ({ page }) => {
  await signIn(page, 'orders@proji.test', '/account/orders')
  await expect(page.getByRole('heading', { name: 'No orders yet' })).toBeVisible()
})

test('U-13 mobile: no overflow and 44px targets on account pages', async ({ page }) => {
  await signIn(page, 'mobile@proji.test')
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 })
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
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${p} @${width}`).toBeLessThanOrEqual(0)
    }
  }
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/account/addresses/new')
  for (const el of await page
    .locator('main input:not([type=radio]):not([type=checkbox]), main button, main select')
    .all()) {
    const box = await el.boundingBox()
    if (box) expect(box.height).toBeGreaterThanOrEqual(44)
  }
})
