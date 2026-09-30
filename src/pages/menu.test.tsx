import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthContext, type AuthState } from '../auth/context'
import { routes } from '../app/routes'
import { CatalogProvider } from '../features/catalog/CatalogProvider'
import { createStaticRepository, type CatalogRepository } from '../features/catalog'
import { DEVELOPMENT_FIXTURE_BOWLS } from '../features/catalog/fixtures'

const auth: AuthState = {
  status: 'signed-out',
  user: null,
  roles: [],
  configured: true,
  signInWithPassword: async () => null,
  signUp: async () => null,
  signOut: async () => {},
}

function renderAt(
  path: string,
  repo: CatalogRepository = createStaticRepository(DEVELOPMENT_FIXTURE_BOWLS),
) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthContext.Provider value={auth}>
      <CatalogProvider repository={repo}>
        <RouterProvider router={router} />
      </CatalogProvider>
    </AuthContext.Provider>,
  )
  return router
}

describe('menu states', () => {
  it('M-01 announces loading', async () => {
    renderAt('/menu', { listBowls: () => new Promise(() => {}), getBowl: async () => null })
    expect(await screen.findByRole('status')).toHaveTextContent(/loading menu/i)
  })

  it('M-02 error then retry succeeds', async () => {
    let calls = 0
    const good = createStaticRepository(DEVELOPMENT_FIXTURE_BOWLS)
    const repo: CatalogRepository = {
      listBowls: async () => {
        if (calls++ === 0) throw new Error('network')
        return good.listBowls()
      },
      getBowl: good.getBowl,
    }
    renderAt('/menu', repo)
    const alert = await screen.findByRole('alert')
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(
      await screen.findByRole('link', { name: 'Kerala Pepper Chicken Kanji' }),
    ).toBeInTheDocument()
  })

  it('M-03 empty catalog shows coming soon and no cards', async () => {
    renderAt('/menu', createStaticRepository([]))
    expect(await screen.findByRole('heading', { name: /menu is coming soon/i })).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.queryByRole('search')).toBeNull()
  })
})

describe('menu content', () => {
  it('M-05 cards link to detail and show text availability + fixture label', async () => {
    renderAt('/menu')
    const link = await screen.findByRole('link', { name: 'Coconut Fish Millet Kanji' })
    expect(link).toHaveAttribute('href', '/menu/coconut-fish-millet-kanji')
    const card = link.closest('article')!
    expect(within(card).getByText('Available')).toBeInTheDocument()
    expect(within(card).getByText('Development sample')).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/development sample data/i)
    expect(screen.getAllByText('Sold out').length).toBe(1)
    expect(screen.getAllByText('Coming soon').length).toBe(1)
  })

  it('M-06 no prices, macros, allergens or claims on the menu', async () => {
    renderAt('/menu')
    await screen.findAllByRole('article')
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/₹|\d+\s*(kcal|cal|g)\b|contains:|high[- ]protein|healthy|cure/i)
  })

  it('M-07 missing image renders labelled fallback', async () => {
    renderAt('/menu')
    expect(
      await screen.findByRole('img', { name: /coconut fish millet kanji — image coming soon/i }),
    ).toBeInTheDocument()
  })
})

describe('filters', () => {
  it('F-04/M-04 filter via URL, show no-match state, clear filters', async () => {
    const user = userEvent.setup()
    const router = renderAt('/menu')
    await screen.findAllByRole('article')
    const base = screen.getByRole('group', { name: 'Base' })
    await user.click(within(base).getByRole('radio', { name: 'Millet' }))
    expect(router.state.location.search).toBe('?base=millet')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.click(
      within(screen.getByRole('group', { name: 'Protein' })).getByRole('radio', {
        name: 'Chicken',
      }),
    )
    expect(await screen.findByRole('heading', { name: /no bowls match/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('')
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('reads filters from the URL and ignores invalid ones', async () => {
    renderAt('/menu?available=1&base=sand')
    await screen.findAllByRole('article')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('checkbox', { name: /available now only/i })).toBeChecked()
    expect(
      within(screen.getByRole('group', { name: 'Base' })).getByRole('radio', { name: 'All' }),
    ).toBeChecked()
  })
})

describe('detail page', () => {
  it('P-01/P-02/P-04 shows components, pending facts and customise CTA', async () => {
    renderAt('/menu/kerala-pepper-chicken-kanji')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Kerala Pepper Chicken Kanji' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Pepper chicken')).toBeInTheDocument()
    expect(screen.getByText('Base')).toBeInTheDocument()
    expect(screen.getAllByText('Pending validation')).toHaveLength(3)
    expect(screen.getByRole('link', { name: /customise this bowl/i })).toHaveAttribute(
      'href',
      '/build?bowl=kerala-pepper-chicken-kanji',
    )
  })

  it('P-04 unavailable bowl has no customise CTA', async () => {
    renderAt('/menu/tandoori-paneer-red-rice-kanji')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('link', { name: /customise/i })).toBeNull()
    expect(screen.getByRole('heading', { name: /not available right now/i })).toBeInTheDocument()
  })

  it('P-03 unknown slug shows not found with link back', async () => {
    renderAt('/menu/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Bowl not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to menu/i })).toHaveAttribute('href', '/menu')
  })
})
