import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import CustomizePage from './CustomizePage'
import { AuthContext, type AuthState } from '../auth/context'
import { AccountProvider } from '../features/account/AccountProvider'
import {
  createMemoryAccountRepository,
  emptyStore,
  type MemoryStore,
} from '../features/account/memoryRepository'
import { resetPreloadCache } from '../features/builder'
import { toConfiguration } from '../features/builder/configuration'

const USER = 'user-a'
function renderAt(path: string, signedIn = true, store: MemoryStore = emptyStore()) {
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
  const router = createMemoryRouter(
    [
      { path: '/build', element: <CustomizePage /> },
      { path: '/login', element: <p>login page</p> },
      { path: '/account/bowls', element: <p>saved bowls page</p> },
    ],
    { initialEntries: [path] },
  )
  render(
    <AuthContext.Provider value={auth}>
      <AccountProvider repository={repo}>
        <RouterProvider router={router} />
      </AccountProvider>
    </AuthContext.Provider>,
  )
  return { router, store, repo }
}
const layers = () =>
  [...document.querySelectorAll<HTMLElement>('[data-testid="bowl-layer"]')].map(
    (e) => e.dataset.ingredient,
  )
const full =
  '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce&toppings=roasted-peanuts'

beforeEach(() => resetPreloadCache())

describe('U-07 save from the builder', () => {
  it('Save bowl appears only once complete', async () => {
    renderAt('/build?base=brown-rice-kanji')
    await screen.findByRole('heading', { name: 'Build Your Own' }) // Stage 5.5 title
    expect(screen.queryByRole('button', { name: 'Save bowl' })).toBeNull()
  })

  it('saves the canonical configuration (IDs only) under a validated name', async () => {
    const user = userEvent.setup()
    const { store } = renderAt(full)
    await user.click(await screen.findByRole('button', { name: 'Save bowl' }))
    const dlg = screen.getByRole('dialog', { name: 'Save bowl' })
    await user.click(within(dlg).getByRole('button', { name: 'Save bowl' }))
    expect(within(dlg).getByLabelText('Bowl name')).toHaveAccessibleDescription(
      /give your bowl a name/i,
    )
    await user.type(within(dlg).getByLabelText('Bowl name'), 'Post-gym')
    await user.click(within(dlg).getByRole('button', { name: 'Save bowl' }))
    expect(await within(dlg).findByText('“Post-gym” is saved to your account.')).toBeInTheDocument()
    expect(store.bowls).toHaveLength(1)
    expect(store.bowls[0].configuration).toEqual({
      version: 1,
      baseId: 'base.brown-rice-kanji',
      proteinId: 'protein.kerala-grilled-fish',
      flavourIds: ['flavour.kerala-coconut-sauce'],
      toppingIds: ['topping.roasted-peanuts'],
    })
  })

  it('U-08 signed out: prompts sign-in with a return path that restores the bowl', async () => {
    const user = userEvent.setup()
    const { router } = renderAt(full, false)
    await user.click(await screen.findByRole('button', { name: 'Save bowl' }))
    await user.click(screen.getByRole('link', { name: 'Sign in to save' }))
    expect(router.state.location.pathname).toBe('/login')
    expect((router.state.location.state as { from: string }).from).toBe(
      '/build?base=brown-rice-kanji&protein=kerala-grilled-fish&flavours=kerala-coconut-sauce&toppings=roasted-peanuts',
    )
  })
})

describe('U-07/U-09 reopen saved bowls', () => {
  it('restores selections exactly', async () => {
    const store = emptyStore()
    const seed = createMemoryAccountRepository(store, () => USER)
    const cfg = toConfiguration({
      base: 'base.red-rice-kanji',
      protein: 'protein.pepper-chicken',
      flavours: ['flavour.garlic-tadka', 'flavour.herb-mint-sauce'],
      toppings: ['topping.fresh-herbs', 'topping.crispy-shallots', 'topping.roasted-peanuts'],
    })!
    const rec = await seed.createSavedBowl('Max bowl', cfg)
    renderAt(`/build?saved=${rec.id}`, true, store)
    expect(await screen.findByText('Opened “Max bowl”.')).toBeInTheDocument()
    expect(layers()).toEqual([
      'base.red-rice-kanji',
      'protein.pepper-chicken',
      'flavour.garlic-tadka',
      'flavour.herb-mint-sauce',
      'topping.fresh-herbs',
      'topping.crispy-shallots',
      'topping.roasted-peanuts',
    ])
  })

  it('stale bowl: keeps valid parts, lists missing, never substitutes', async () => {
    const store = emptyStore()
    store.bowls.push({
      id: '00000000-0000-4000-8000-000000000099',
      userId: USER,
      name: 'Old',
      configuration: {
        version: 1,
        baseId: 'base.millet-kanji',
        proteinId: 'protein.lobster',
        flavourIds: [],
        toppingIds: ['topping.gold-leaf'],
      },
      createdAt: 't',
      updatedAt: 't',
    })
    renderAt('/build?saved=00000000-0000-4000-8000-000000000099', true, store)
    expect(await screen.findByText(/No longer available: lobster, gold leaf/)).toBeInTheDocument()
    expect(layers()).toEqual(['base.millet-kanji'])
  })

  it('corrupted stored data shows a safe message', async () => {
    const store = emptyStore()
    store.bowls.push({
      id: '00000000-0000-4000-8000-000000000098',
      userId: USER,
      name: 'Bad',
      configuration: { hacked: true },
      createdAt: 't',
      updatedAt: 't',
    })
    renderAt('/build?saved=00000000-0000-4000-8000-000000000098', true, store)
    expect(
      await screen.findByText(/can’t be opened because its saved data is not valid/),
    ).toBeInTheDocument()
    expect(layers()).toEqual([])
  })

  it.each([
    ['malformed id', '/build?saved=../../etc', true, /link is not valid/],
    [
      'unknown id',
      '/build?saved=00000000-0000-4000-8000-000000000001',
      true,
      /couldn’t find that saved bowl/,
    ],
    [
      'another user’s bowl id',
      '/build?saved=00000000-0000-4000-8000-000000000097',
      true,
      /couldn’t find that saved bowl/,
    ],
    ['signed out', '/build?saved=00000000-0000-4000-8000-000000000001', false, /sign in to open/i],
  ])('%s', async (_n, path, signedIn, msg) => {
    const store = emptyStore()
    store.bowls.push({
      id: '00000000-0000-4000-8000-000000000097',
      userId: 'someone-else',
      name: 'Not yours',
      configuration: {
        version: 1,
        baseId: 'base.millet-kanji',
        proteinId: 'protein.boiled-egg',
        flavourIds: [],
        toppingIds: [],
      },
      createdAt: 't',
      updatedAt: 't',
    })
    renderAt(path, signedIn, store)
    expect(await screen.findByText(msg)).toBeInTheDocument()
    expect(layers()).toEqual([])
  })
})
