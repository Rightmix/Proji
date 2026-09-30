import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthState } from '../auth/context'
import type { Role } from '../auth/roles'
import { routes } from './routes'

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

const signedIn = (roles: Role[]): Partial<AuthState> => ({
  status: 'signed-in',
  roles,
  user: { id: 'u1', email: 'a@b.c' } as AuthState['user'],
})

describe('public routes', () => {
  it.each([
    ['/', /build your bowl\. build your body\./i],
    ['/menu', /^menu$/i],
    ['/build', /^customize$/i], // Stage 4: approved master top bar title
    ['/login', /sign in/i],
    ['/unauthorized', /access denied/i],
    ['/does-not-exist', /page not found/i],
  ])('%s renders', async (path, heading) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })
})

describe('protected routes', () => {
  it.each(['/account', '/admin', '/kitchen'])(
    '%s redirects signed-out users to login',
    async (p) => {
      const router = renderAt(p)
      await screen.findByRole('heading', { name: /sign in/i })
      expect(router.state.location.pathname).toBe('/login')
    },
  )

  it('customer is denied admin and kitchen', async () => {
    const router = renderAt('/admin', signedIn(['customer']))
    await screen.findByRole('heading', { name: /access denied/i })
    expect(router.state.location.pathname).toBe('/unauthorized')
    document.body.innerHTML = ''
    renderAt('/kitchen', signedIn(['customer']))
    await screen.findByRole('heading', { name: /access denied/i })
  })

  it('customer can open account', async () => {
    renderAt('/account', signedIn(['customer']))
    expect(await screen.findByText(/signed in as a@b.c/i)).toBeInTheDocument()
  })

  it('kitchen staff can open kitchen but not admin', async () => {
    renderAt('/kitchen', signedIn(['customer', 'kitchen']))
    expect(await screen.findByRole('heading', { name: /^kitchen$/i })).toBeInTheDocument()
    document.body.innerHTML = ''
    renderAt('/admin', signedIn(['customer', 'kitchen']))
    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument()
  })

  it('admin can open admin and kitchen; rd can open admin', async () => {
    renderAt('/admin', signedIn(['admin']))
    expect(await screen.findByRole('heading', { name: /admin & r&d/i })).toBeInTheDocument()
    document.body.innerHTML = ''
    renderAt('/kitchen', signedIn(['admin']))
    expect(await screen.findByRole('heading', { name: /^kitchen$/i })).toBeInTheDocument()
    document.body.innerHTML = ''
    renderAt('/admin', signedIn(['rd']))
    expect(await screen.findByRole('heading', { name: /admin & r&d/i })).toBeInTheDocument()
  })

  it('shows loading state while auth resolves', async () => {
    renderAt('/admin', { status: 'loading' })
    expect(await screen.findByRole('status')).toHaveTextContent(/checking access/i)
  })
})
