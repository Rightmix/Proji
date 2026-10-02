import { render, screen, within } from '@testing-library/react'
import { cartStore } from '../features/cart/cartStore'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthState } from '../auth/context'
import { routes } from '../app/routes'

function renderAt(path: string, auth: Partial<AuthState> = {}) {
  const value: AuthState = {
    status: 'signed-out',
    user: null,
    roles: [],
    configured: true,
    signInWithPassword: async () => null,
    signUp: async () => null,
    signOut: async () => {},
    ...auth,
  }
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthContext.Provider value={value}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
  return router
}

// Stage 5.5: the mobile hamburger menu is replaced by the approved bottom navigation.
describe('N-01 bottom navigation', () => {
  beforeEach(() => cartStore.set([]))
  it('shows Home / Build / Cart / Account with icons+labels, marks the active tab and navigates', async () => {
    const user = userEvent.setup()
    const router = renderAt('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Home', 'Build', 'Cart', 'Account'])
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(links.every((l) => l.querySelector('svg'))).toBe(true)
    await user.click(within(nav).getByRole('link', { name: /^Cart/ }))
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/cart')) // lazy route
    expect(
      within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
        name: /^Cart/,
      }),
    ).toHaveAttribute('aria-current', 'page')
  })
  it('cart badge reflects item count', async () => {
    cartStore.set([{ id: 'x', name: 'Bowl', mealSlug: null, configuration: {}, quantity: 3 }])
    renderAt('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: /cart, 3 items/i })).toBeInTheDocument()
  })
  it('floating chat button is present and opens an honest support dialog', async () => {
    renderAt('/')
    await userEvent.click(await screen.findByRole('button', { name: /chat with proji support/i }))
    expect(screen.getByRole('dialog', { name: 'Chat with PROJI' })).toHaveTextContent(
      /opens together with ordering/i,
    )
  })
  it('full-screen meal detail hides the bottom nav', async () => {
    renderAt('/menu/pepper-chicken-brown-rice-bowl')
    await screen.findByRole('heading', { level: 1, name: /pepper chicken/i })
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull()
  })
})

describe('N-02 auth-aware navigation (Stage 1 behaviour)', () => {
  it('signed out: header shows Sign in, not Account; bottom nav Account still reachable', async () => {
    renderAt('/')
    const header = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(header).getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(within(header).queryByRole('link', { name: 'Account' })).toBeNull()
    expect(
      within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
        name: 'Account',
      }),
    ).toBeInTheDocument()
  })
  it('signed in shows Account and Sign out, which calls signOut', async () => {
    const signOut = vi.fn(async () => {})
    renderAt('/', {
      status: 'signed-in',
      roles: ['customer'],
      user: { id: 'u' } as AuthState['user'],
      signOut,
    })
    const header = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(header).getByRole('link', { name: 'Account' })).toBeInTheDocument()
    await userEvent.click(within(header).getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalled()
    expect(within(header).queryByRole('link', { name: 'Sign in' })).toBeNull()
  })
})
