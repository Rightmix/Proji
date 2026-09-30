import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import CustomizePage from './CustomizePage'
import { CatalogProvider } from '../features/catalog/CatalogProvider'
import { createStaticRepository } from '../features/catalog'
import { DEVELOPMENT_FIXTURE_BOWLS } from '../features/catalog/fixtures'
import { resetPreloadCache } from '../features/builder'

function renderAt(path = '/build') {
  const router = createMemoryRouter(
    [
      { path: '/build', element: <CustomizePage /> },
      { path: '/', element: <p>home</p> },
    ],
    {
      initialEntries: [path],
    },
  )
  render(
    <CatalogProvider repository={createStaticRepository(DEVELOPMENT_FIXTURE_BOWLS)}>
      <RouterProvider router={router} />
    </CatalogProvider>,
  )
  return router
}
const price = () =>
  screen.getByTestId('live-price').textContent!.replace(/illustrative price\s*/i, '')
const strip = (label: string) =>
  screen
    .getByRole('group', { name: new RegExp(`^[\\d.]+g? ${label}$`, 'i') })
    .getAttribute('aria-label')
const next = () => userEvent.click(screen.getByRole('button', { name: /^next/i }))

beforeEach(() => resetPreloadCache())

describe('CustomizePage', () => {
  it('P-01/P-13 direct /build: empty bowl, ₹0, zeros, locked steps, prototype labelling', async () => {
    renderAt()
    expect(await screen.findByRole('heading', { level: 1, name: 'Customize' })).toBeInTheDocument()
    expect(screen.getByText(/your bowl builds here/i)).toBeInTheDocument()
    expect(price()).toBe('₹0')
    expect(strip('kcal')).toBe('0 Kcal')
    expect(screen.getByTestId('prototype-notice')).toHaveTextContent(
      /illustrative prices & nutrition, not validated/i,
    )
    expect(screen.getByRole('tab', { name: /protein/i })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: /^next/i })).toBeDisabled()
  })

  it('P-02 master journey updates bowl, price and macros live', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.click(await screen.findByRole('radio', { name: /brown rice kanji/i }))
    expect(price()).toBe('₹120')
    expect(strip('protein')).toBe('5g Protein')
    await next()
    expect(screen.getByRole('radio', { name: /kerala grilled fish/i })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /kerala grilled fish/i }))
    expect(price()).toBe('₹270')
    expect(strip('protein')).toBe('33g Protein')
    await next()
    await user.click(screen.getByRole('checkbox', { name: /kerala coconut sauce/i }))
    await next()
    await user.click(screen.getByRole('checkbox', { name: /roasted peanuts/i }))
    await user.click(screen.getByRole('checkbox', { name: /crispy shallots/i }))
    expect(price()).toBe('₹340')
    expect(strip('kcal')).toBe('585 Kcal')
    expect(
      screen.getByRole('img', {
        name: /your bowl: brown rice kanji, kerala grilled fish, kerala coconut sauce, roasted peanuts, crispy shallots/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to cart/i })).toHaveTextContent('₹340')
  })

  it('P-03 tabs: arrow keys, completed checks, back preserves', async () => {
    const user = userEvent.setup()
    renderAt('/build?base=millet-kanji&protein=boiled-egg&flavours=garlic-tadka')
    const baseTab = await screen.findByRole('tab', { name: /base/i })
    expect(baseTab).toHaveAccessibleName(/done/i)
    baseTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: /protein/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /protein/i })).toHaveFocus()
    expect(screen.getByRole('radio', { name: /boiled egg/i })).toBeChecked()
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: /topping/i })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('radio', { name: /millet kanji/i })).toBeChecked()
    await user.click(screen.getByRole('tab', { name: /flavour/i }))
    expect(screen.getByRole('checkbox', { name: /garlic tadka/i })).toBeChecked()
  })

  it('P-04 limit messaging and disabled extras', async () => {
    const user = userEvent.setup()
    renderAt('/build?base=millet-kanji&protein=boiled-egg')
    await user.click(await screen.findByRole('tab', { name: /flavour/i }))
    await user.click(screen.getByRole('checkbox', { name: /garlic tadka/i }))
    await user.click(screen.getByRole('checkbox', { name: /herb mint/i }))
    expect(screen.getByText(/maximum of 2 flavours/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /spicy chilli/i })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: /garlic tadka/i }))
    expect(screen.queryByText(/maximum of 2 flavours/i)).toBeNull()
  })

  it('P-05 View Nutrition dialog with breakdown and illustrative label', async () => {
    const user = userEvent.setup()
    renderAt('/build?base=brown-rice-kanji&protein=kerala-grilled-fish')
    await user.click(await screen.findByRole('button', { name: 'View Nutrition' }))
    const dlg = screen.getByRole('dialog', { name: 'Nutrition' })
    expect(within(dlg).getByRole('rowheader', { name: 'Kerala Grilled Fish' })).toBeInTheDocument()
    expect(within(dlg).getByRole('rowheader', { name: 'Total' }).parentElement).toHaveTextContent(
      '400',
    )
    expect(within(dlg).getByTestId('prototype-notice')).toHaveTextContent(
      /no allergen information/i,
    )
    await user.click(within(dlg).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('P-06 Add to Cart is a prototype: no network, clear message, configuration', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    renderAt('/build?base=red-rice-kanji&protein=pepper-chicken&toppings=fresh-herbs')
    await user.click(await screen.findByRole('tab', { name: /topping/i }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    const dlg = screen.getByRole('dialog', { name: 'Your bowl' })
    expect(within(dlg).getByRole('alert')).toHaveTextContent(
      /prototype only.*no order was created.*no payment/i,
    )
    expect(within(dlg).getByText('Fresh Herbs')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('P-07 share copies a restorable link', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderAt('/build?base=millet-kanji&protein=boiled-egg')
    await user.click(await screen.findByRole('button', { name: /share/i }))
    expect(writeText).toHaveBeenCalledWith(
      expect.stringMatching(/\/build\?base=millet-kanji&protein=boiled-egg$/),
    )
    expect(await screen.findByText('Link copied')).toBeInTheDocument()
  })

  it('P-08 /build?bowl=<stage 3 slug> preloads compatible components', async () => {
    renderAt('/build?bowl=coconut-fish-millet-kanji')
    expect(await screen.findByText(/started from coconut fish millet kanji/i)).toHaveTextContent(
      /seasonal vegetables/i,
    )
    expect(screen.getByRole('radio', { name: /millet kanji/i })).toBeChecked()
    expect(price()).toBe('₹320') // 130 + 150 + 30 + 10 (illustrative)
  })
})
