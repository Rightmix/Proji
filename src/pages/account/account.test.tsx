import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthState } from '../../auth/context'
import type { Role } from '../../auth/roles'
import { routes } from '../../app/routes'
import { AccountProvider } from '../../features/account/AccountProvider'
import {
  createMemoryAccountRepository,
  emptyStore,
  type MemoryStore,
} from '../../features/account/memoryRepository'
import { AccountError, type AccountRepository } from '../../features/account/types'
import { emptyAddress } from '../../features/account/validation'

const USER = 'user-a'
function auth(signedIn: boolean, roles: Role[] = ['customer']): AuthState {
  return {
    status: signedIn ? 'signed-in' : 'signed-out',
    user: signedIn ? ({ id: USER, email: 'a@proji.test' } as AuthState['user']) : null,
    roles: signedIn ? roles : [],
    configured: true,
    signInWithPassword: async () => null,
    signUp: async () => null,
    signOut: vi.fn(async () => {}),
  }
}
function renderAt(
  path: string,
  opts: {
    signedIn?: boolean
    repo?: AccountRepository | null
    store?: MemoryStore
    roles?: Role[]
  } = {},
) {
  const store = opts.store ?? emptyStore()
  const repo =
    opts.repo !== undefined ? opts.repo : createMemoryAccountRepository(store, () => USER)
  const a = auth(opts.signedIn ?? true, opts.roles)
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthContext.Provider value={a}>
      <AccountProvider repository={repo}>
        <RouterProvider router={router} />
      </AccountProvider>
    </AuthContext.Provider>,
  )
  return { router, store, auth: a }
}
const addr = {
  ...emptyAddress('BH'),
  recipientName: 'Akhil',
  phone: '+973 3300 1234',
  line1: 'Building 2411',
  city: 'Manama',
}

describe('U-01 protection', () => {
  it.each(['/account', '/account/addresses', '/account/bowls', '/account/addresses/new'])(
    '%s redirects signed-out users and keeps the return path',
    async (p) => {
      const { router } = renderAt(p, { signedIn: false })
      await screen.findByRole('heading', { name: /sign in/i })
      expect(router.state.location.pathname).toBe('/login')
      expect((router.state.location.state as { from: string }).from).toBe(p)
    },
  )
  it('kitchen-only staff can use their own account pages (no extra data access)', async () => {
    renderAt('/account/bowls', { roles: ['kitchen'] })
    expect(await screen.findByRole('heading', { name: 'Saved bowls' })).toBeInTheDocument()
  })
})

describe('U-02 overview and sign out', () => {
  it('shows email, sections and signs out', async () => {
    const { auth: a } = renderAt('/account')
    expect(await screen.findByText(/signed in as a@proji.test/i)).toBeInTheDocument()
    for (const s of ['Profile', 'Addresses', 'Saved bowls', 'Preferences', 'Order history'])
      expect(screen.getByRole('heading', { level: 2, name: s })).toBeInTheDocument()
    await userEvent.click(
      within(screen.getByRole('main')).getByRole('button', { name: 'Sign out' }),
    )
    expect(a.signOut).toHaveBeenCalled()
  })
})

describe('U-03/U-04 profile', () => {
  it('recreates a missing profile, validates, focuses the invalid field and saves', async () => {
    const user = userEvent.setup()
    const { store } = renderAt('/account/profile')
    const phone = await screen.findByLabelText('Phone')
    expect(store.profiles[USER]).toBeDefined()
    await user.type(screen.getByLabelText('Full name'), 'Akhil Raj')
    await user.type(phone, 'not a phone')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAccessibleDescription(/valid phone number/i)
    await vi.waitFor(() => expect(phone).toHaveFocus())
    await user.clear(phone)
    await user.type(phone, '+91 98470 12345')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument()
    expect(store.profiles[USER]).toMatchObject({ fullName: 'Akhil Raj', phone: '+91 98470 12345' })
  })
})

describe('U-05 addresses', () => {
  it('empty state → add (with validation) → list with default', async () => {
    const user = userEvent.setup()
    const { store } = renderAt('/account/addresses')
    expect(await screen.findByRole('heading', { name: 'No saved addresses' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Add address' }))
    await user.click(await screen.findByRole('button', { name: 'Save address' }))
    expect(screen.getByText('Please fix the highlighted fields.')).toBeInTheDocument()
    await vi.waitFor(() => expect(screen.getByLabelText(/recipient name/i)).toHaveFocus())
    expect(screen.getByLabelText(/PIN code/i)).toHaveAttribute('aria-invalid', 'true') // India default requires PIN
    await user.selectOptions(screen.getByLabelText('Country'), 'BH')
    await user.type(screen.getByLabelText(/recipient name/i), 'Akhil')
    await user.type(screen.getByLabelText(/^phone/i), '+973 3300 1234')
    await user.type(screen.getByLabelText(/flat \/ house/i), 'Building 2411')
    await user.type(screen.getByLabelText(/block \/ area/i), 'Block 428')
    await user.type(screen.getByLabelText(/city/i), 'Manama')
    await user.click(screen.getByRole('button', { name: 'Save address' }))
    expect(await screen.findByText('Address added.')).toBeInTheDocument()
    const card = await screen.findByLabelText('Home address')
    expect(within(card).getByText('Default')).toBeInTheDocument()
    expect(within(card).getByText(/Building 2411, Block 428, Manama, Bahrain/)).toBeInTheDocument()
    expect(store.addresses).toHaveLength(1)
  })

  it('switch default, edit, delete with confirmation and cancel', async () => {
    const user = userEvent.setup()
    const store = emptyStore()
    const repo = createMemoryAccountRepository(store, () => USER)
    await repo.createAddress(addr)
    await repo.createAddress({ ...addr, label: 'work', line1: 'Office' })
    renderAt('/account/addresses', { store, repo })
    await user.click(await screen.findByRole('button', { name: 'Make Work the default address' }))
    expect(await screen.findByText('Work is now your default address.')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Work address')).getByText('Default')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Home address' }))
    const dlg = screen.getByRole('dialog', { name: 'Delete address?' })
    await user.click(within(dlg).getByRole('button', { name: 'Cancel' }))
    expect(store.addresses).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Delete Home address' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete address' }),
    )
    expect(await screen.findByText('Address deleted.')).toBeInTheDocument()
    expect(store.addresses).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'Edit Work address' }))
    const line1 = await screen.findByLabelText(/flat \/ house/i)
    expect(line1).toHaveValue('Office')
    await user.clear(line1)
    await user.type(line1, 'New office')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Address updated.')).toBeInTheDocument()
    expect(store.addresses[0].line1).toBe('New office')
  })

  it('U-12 malformed or unknown address id → not found', async () => {
    renderAt('/account/addresses/not-a-uuid')
    expect(await screen.findByText(/couldn’t find that/i)).toBeInTheDocument()
  })

  it('error state with retry', async () => {
    let fail = true
    const store = emptyStore()
    const base = createMemoryAccountRepository(store, () => USER)
    const repo: AccountRepository = {
      ...base,
      listAddresses: async () => {
        if (fail) throw new AccountError('unknown', 'network down')
        return base.listAddresses()
      },
    }
    renderAt('/account/addresses', { repo })
    const alert = await screen.findByRole('alert')
    fail = false
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('heading', { name: 'No saved addresses' })).toBeInTheDocument()
  })
})

describe('U-06 preferences', () => {
  it('persist and reload', async () => {
    const user = userEvent.setup()
    const store = emptyStore()
    renderAt('/account/preferences', { store })
    await user.click(await screen.findByLabelText('Hot'))
    await user.click(screen.getByLabelText(/include cutlery/i))
    await user.click(screen.getByRole('button', { name: 'Save preferences' }))
    expect(await screen.findByText('Preferences saved.')).toBeInTheDocument()
    expect(store.preferences[USER]).toEqual({ spiceLevel: 'hot', includeCutlery: false })
  })
})

describe('U-07 saved bowls', () => {
  it('list, stale warning, rename (conflict), delete', async () => {
    const user = userEvent.setup()
    const store = emptyStore()
    const repo = createMemoryAccountRepository(store, () => USER)
    await repo.createSavedBowl('Gym bowl', {
      version: 1,
      baseId: 'base.brown-rice-kanji',
      proteinId: 'protein.kerala-grilled-fish',
      flavourIds: ['flavour.kerala-coconut-sauce'],
      toppingIds: [],
    })
    await repo.createSavedBowl('Old bowl', {
      version: 1,
      baseId: 'base.millet-kanji',
      proteinId: 'protein.lobster',
      flavourIds: [],
      toppingIds: [],
    })
    renderAt('/account/bowls', { store, repo })
    expect(
      await screen.findByText(/Brown Rice Kanji · Kerala Grilled Fish · Kerala Coconut Sauce/),
    ).toBeInTheDocument()
    expect(screen.getByText(/no longer available: lobster/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Gym bowl in the builder' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/build\?saved=/),
    )

    await user.click(screen.getByRole('button', { name: 'Rename Gym bowl' }))
    const name = screen.getByLabelText('Bowl name')
    await user.clear(name)
    await user.type(name, 'old BOWL')
    await user.click(screen.getByRole('button', { name: 'Save name' }))
    expect(await screen.findByText('You already have a bowl with that name.')).toBeInTheDocument()
    await user.clear(name)
    await user.type(name, 'Post-gym')
    await user.click(screen.getByRole('button', { name: 'Save name' }))
    expect(await screen.findByText('Renamed to “Post-gym”.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Old bowl' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete bowl' }),
    )
    expect(await screen.findByText('“Old bowl” deleted.')).toBeInTheDocument()
    expect(store.bowls.map((b) => b.name)).toEqual(['Post-gym'])
  })
})

describe('U-10 expired session', () => {
  it('repository auth error shows sign-in-again with return path', async () => {
    const repo = createMemoryAccountRepository(emptyStore(), () => null)
    renderAt('/account/bowls', { repo })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/session has expired/i)
    expect(within(alert).getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})

describe('U-11 order history boundary', () => {
  it('shows an empty state and no fake orders', async () => {
    renderAt('/account/orders')
    expect(await screen.findByRole('heading', { name: 'No orders yet' })).toBeInTheDocument()
    expect(
      screen.getByTestId('orders-empty').closest('section')!.querySelectorAll('li'),
    ).toHaveLength(0)
  })
})

describe('accounts unavailable (Supabase not configured)', () => {
  it('shows an explicit unavailable message', async () => {
    renderAt('/account/addresses', { repo: null })
    expect(await screen.findByText(/not available in this environment/i)).toBeInTheDocument()
  })
})
