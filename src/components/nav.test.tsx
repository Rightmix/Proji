import { render, screen } from '@testing-library/react'
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

describe('N-01 mobile menu', () => {
  it('toggles aria-expanded, closes on navigation and Escape', async () => {
    const user = userEvent.setup()
    const router = renderAt('/')
    const toggle = await screen.findByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const panel = document.getElementById('mobile-nav')!
    expect(panel).not.toBeVisible()
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(panel).toBeVisible()
    await user.keyboard('{Escape}')
    expect(panel).not.toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const menuLinks = screen.getAllByRole('link', { name: 'Menu' })
    await user.click(menuLinks[menuLinks.length - 1])
    expect(router.state.location.pathname).toBe('/menu')
    expect(panel).not.toBeVisible()
  })
})

describe('N-02 auth-aware navigation (Stage 1 behaviour)', () => {
  it('signed out shows Sign in, not Account', async () => {
    renderAt('/')
    expect((await screen.findAllByRole('link', { name: 'Sign in' })).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Account' })).toBeNull()
  })
  it('signed in shows Account and Sign out, which calls signOut', async () => {
    const signOut = vi.fn(async () => {})
    renderAt('/', {
      status: 'signed-in',
      roles: ['customer'],
      user: { id: 'u' } as AuthState['user'],
      signOut,
    })
    expect((await screen.findAllByRole('link', { name: 'Account' })).length).toBeGreaterThan(0)
    await userEvent.click(screen.getAllByRole('button', { name: 'Sign out' })[0])
    expect(signOut).toHaveBeenCalled()
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull()
  })
})
