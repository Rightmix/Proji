import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthState } from '../auth/context'
import { routes } from '../app/routes'
import { AccountProvider } from '../features/account/AccountProvider'
import { createMemoryAccountRepository, emptyStore } from '../features/account/memoryRepository'
import { emptyAddress } from '../features/account/validation'
import { CatalogProvider } from '../features/catalog/CatalogProvider'
import { createStaticRepository } from '../features/catalog'
import { DEVELOPMENT_FIXTURE_BOWLS } from '../features/catalog/fixtures'
import { cartStore } from '../features/cart/cartStore'

const USER = 'u1'
function renderAt(path: string | string[], signedIn = false) {
  const store = emptyStore()
  const repo = createMemoryAccountRepository(store, () => (signedIn ? USER : null))
  const auth = {
    status: signedIn ? 'signed-in' : 'signed-out',
    user: signedIn ? { id: USER, email: 'a@proji.test' } : null,
    roles: signedIn ? ['customer'] : [],
    configured: true,
    signInWithPassword: async () => null,
    signUp: async () => null,
    signOut: async () => {},
  } as AuthState
  const router = createMemoryRouter(routes, { initialEntries: Array.isArray(path) ? path : [path] })
  render(
    <AuthContext.Provider value={auth}>
      <AccountProvider repository={repo}>
        <CatalogProvider repository={createStaticRepository(DEVELOPMENT_FIXTURE_BOWLS)}>
          <RouterProvider router={router} />
        </CatalogProvider>
      </AccountProvider>
    </AuthContext.Provider>,
  )
  return { router, repo, store }
}
const main = () => within(screen.getByRole('main'))

describe('Category page', () => {
  it('back arrow, title, count, protein chips, search, 2-column grid', async () => {
    const user = userEvent.setup()
    const { router } = renderAt(['/', '/categories/millet'])
    expect(await screen.findByRole('heading', { level: 1, name: 'Millet' })).toBeInTheDocument()
    expect(await screen.findByText('3 meals')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Millet' }).className).toMatch(/grid-cols-2/)
    await user.click(screen.getByRole('radio', { name: 'Fish' }))
    expect(screen.getByText('2 meals')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Search meals' }))
    await user.type(screen.getByRole('searchbox', { name: /search millet/i }), 'mint')
    expect(screen.getByText('1 meal')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?protein=fish&q=mint')
    await user.click(main().getByRole('button', { name: 'Back' }))
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
  it('unknown category', async () => {
    renderAt('/categories/nope')
    expect(await screen.findByRole('heading', { name: 'Category not found' })).toBeInTheDocument()
  })
})

describe('Meal detail', () => {
  it('hero actions, labelled estimates, components, favourite, customize', async () => {
    const user = userEvent.setup()
    renderAt('/menu/grilled-fish-millet-bowl')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Grilled Fish Millet Bowl' }),
    ).toBeInTheDocument()
    expect(main().getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByTestId('meal-estimate')).toHaveTextContent(
      /435 kcal.*35g protein.*49g carbs.*11g fat.*illustrative/i,
    )
    const includes = screen.getByRole('heading', { name: 'This includes' }).closest('section')!
    expect(within(includes).getByText('Herb mint sauce')).toBeInTheDocument()
    expect(within(includes).getAllByText(/kcal · illustrative/)).toHaveLength(5)
    const fav = screen.getByRole('button', { name: /save grilled fish millet bowl to favourites/i })
    await user.click(fav)
    expect(
      screen.getByRole('button', { name: /remove grilled fish millet bowl from favourites/i }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Pending validation')).toHaveLength(3)
    expect(screen.getByRole('link', { name: /customize this bowl/i })).toHaveAttribute(
      'href',
      '/build?bowl=grilled-fish-millet-bowl',
    )
  })
})

describe('Quick add → cart → checkout boundary', () => {
  it('quick-add from a card, then cart quantity, totals, delete and checkout link', async () => {
    const user = userEvent.setup()
    renderAt('/categories/all')
    await user.click(
      await screen.findByRole('button', { name: 'Add Grilled Fish Millet Bowl to cart' }),
    )
    await user.click(screen.getByRole('button', { name: 'Add Grilled Fish Millet Bowl to cart' }))
    expect(cartStore.get()).toHaveLength(1)
    expect(cartStore.get()[0].quantity).toBe(2)
    await user.click(
      within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
        name: /^Cart/,
      }),
    )
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your Cart (2)' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('cart-total')).toHaveTextContent('₹640') // 2 × ₹320 illustrative
    expect(screen.getByTestId('cart-nutrition')).toHaveTextContent(/870 kcal.*70g protein/)
    await user.click(
      screen.getByRole('button', { name: 'Decrease quantity of Grilled Fish Millet Bowl' }),
    )
    expect(screen.getByTestId('cart-total')).toHaveTextContent('₹320')
    expect(screen.getByRole('link', { name: /proceed to checkout/i })).toHaveAttribute(
      'href',
      '/checkout',
    )
    await user.click(screen.getByRole('button', { name: 'Remove Grilled Fish Millet Bowl' }))
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()
  })

  it('unavailable cart lines block checkout', async () => {
    cartStore.set([
      {
        id: '1',
        name: 'Old',
        mealSlug: null,
        configuration: {
          version: 1,
          baseId: 'base.x',
          proteinId: 'protein.y',
          flavourIds: [],
          toppingIds: [],
        },
        quantity: 1,
      },
    ])
    renderAt('/cart')
    expect(await screen.findByText(/no longer available/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Proceed to Checkout' })).toBeDisabled()
  })

  it('checkout: addresses, method, time; payment disabled; no network; preview is labelled', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    const { repo } = renderAt('/checkout', true)
    await repo.createAddress({
      ...emptyAddress('BH'),
      recipientName: 'A',
      phone: '+97333001234',
      line1: 'House 12',
      city: 'Manama',
    })
    expect(await screen.findByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument()
    expect(main().getByRole('button', { name: 'Back' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Pickup' }))
    expect(screen.getByRole('heading', { name: '3. Pickup time' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to Payment' })).toBeDisabled()
    expect(screen.getByTestId('stage6-boundary')).toHaveTextContent(/does not create an order/i)
    await user.click(screen.getByRole('link', { name: /preview the order confirmation screen/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /design preview only.*no order was placed/i,
    )
    expect(screen.getByRole('button', { name: 'Track Order' })).toBeDisabled()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})

describe('BYO (Stage 5.5 layout)', () => {
  it('vertical step rail, 3-column tile grid with 2-column container fallback, n/4 headings', async () => {
    renderAt('/build')
    const rail = await screen.findByRole('tablist', { name: 'Bowl steps' })
    expect(rail).toHaveAttribute('aria-orientation', 'vertical')
    expect(
      within(rail)
        .getAllByRole('tab')
        .map((t) => t.textContent),
    ).toEqual(['Base', 'Protein (locked)', 'Flavour (locked)', 'Toppings (locked)'])
    const grid = screen.getByTestId('ingredient-grid')
    expect(grid.className).toMatch(/grid-cols-3/)
    expect(grid.className).toMatch(/@max-\[15\.5rem\]:grid-cols-2/)
    expect(screen.getByRole('group', { name: 'Choose Your Base' })).toHaveTextContent('1/4')
    const tile = screen.getByRole('radio', { name: /brown rice kanji/i }).closest('label')!
    expect(tile).toHaveTextContent(/220 kcal.*5g protein.*\+₹120/)
  })

  it('live totals update on every selection and the CTA names the next step', async () => {
    const user = userEvent.setup()
    renderAt('/build')
    await user.click(await screen.findByRole('radio', { name: /millet kanji/i }))
    expect(screen.getByTestId('live-price')).toHaveTextContent('₹130')
    expect(screen.getByRole('button', { name: 'Next: Protein' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Next: Protein' }))
    await user.click(screen.getByRole('radio', { name: /boiled egg/i }))
    expect(screen.getByTestId('live-price')).toHaveTextContent('₹170')
    expect(screen.getByRole('group', { name: '19g Protein' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next: Flavour' }))
    expect(screen.getByRole('button', { name: 'Next: Toppings' })).toBeEnabled()
  })

  it('builder persistence: leaving and coming back (Back) keeps selections and step', async () => {
    const user = userEvent.setup()
    const { router } = renderAt(['/', '/build'])
    await user.click(await screen.findByRole('radio', { name: /red rice kanji/i }))
    await user.click(screen.getByRole('button', { name: 'Next: Protein' }))
    await user.click(screen.getByRole('radio', { name: /pepper chicken/i }))
    await router.navigate('/cart')
    await screen.findByRole('heading', { level: 1, name: /your cart/i })
    await router.navigate(-1)
    expect(await screen.findByRole('radio', { name: /pepper chicken/i })).toBeChecked()
    expect(screen.getByRole('tab', { name: /protein/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('live-price')).toHaveTextContent('₹270')
  })

  it('Add to Cart puts the bowl in the cart (prototype, IDs only)', async () => {
    const user = userEvent.setup()
    renderAt('/build?base=brown-rice-kanji&protein=kerala-grilled-fish&toppings=fresh-herbs')
    await user.click(await screen.findByRole('tab', { name: /toppings/i }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(screen.getByRole('dialog', { name: 'Your bowl' })).toHaveTextContent(
      /added to the cart on this device/i,
    )
    expect(cartStore.get()[0].configuration).toEqual({
      version: 1,
      baseId: 'base.brown-rice-kanji',
      proteinId: 'protein.kerala-grilled-fish',
      flavourIds: [],
      toppingIds: ['topping.fresh-herbs'],
    })
  })
})
