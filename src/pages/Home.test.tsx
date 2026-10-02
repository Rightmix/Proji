import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { CatalogProvider } from '../features/catalog/CatalogProvider'
import { createStaticRepository } from '../features/catalog'
import { DEVELOPMENT_FIXTURE_BOWLS } from '../features/catalog/fixtures'

function renderHome(bowls = DEVELOPMENT_FIXTURE_BOWLS) {
  return render(
    <CatalogProvider repository={createStaticRepository(bowls)}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </CatalogProvider>,
  )
}

describe('Homepage (Stage 5.5 approved design)', () => {
  it('H-01 single h1, Build Your Own CTA, search, categories and View all', async () => {
    renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your Bowl. Your Rules.')
    expect(screen.getByRole('link', { name: /build your own/i })).toHaveAttribute('href', '/build')
    expect(screen.getByRole('searchbox', { name: /search meals/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'High Protein' })).toHaveAttribute(
      'href',
      '/categories/high-protein',
    )
    expect(screen.getByRole('link', { name: 'View all Categories' })).toHaveAttribute(
      'href',
      '/categories/all',
    )
  })

  it('H-02 meals use 2-column cards; all figures labelled illustrative; no health claims', async () => {
    const { container } = renderHome()
    const popular = await screen.findByRole('list', { name: 'Popular right now' })
    expect(popular.className).toMatch(/grid-cols-2/)
    const cards = within(popular).getAllByRole('article')
    expect(cards.length).toBeGreaterThan(0)
    for (const c of cards) {
      expect(c).toHaveTextContent(/\d+ kcal/)
      expect(c).toHaveTextContent(/protein/)
      expect(c).toHaveTextContent(/carbs/)
      expect(c).toHaveTextContent(/fat/)
      expect(c).toHaveTextContent(/₹\d+/)
      expect(within(c).getByTestId('illustrative-tag')).toBeInTheDocument()
      expect(within(c).getByRole('button', { name: /favourites/i })).toBeInTheDocument()
      expect(within(c).getByRole('button', { name: /add .* to cart/i })).toBeInTheDocument()
    }
    expect(container.textContent).not.toMatch(
      /\b(cure|treat|heal|detox|weight[- ]loss|diabet|immunity|clinically|guaranteed)\w*/i,
    )
  })

  it('production default (empty catalog) shows coming soon, never sample meals', async () => {
    renderHome([])
    expect(await screen.findByRole('heading', { name: /menu is coming soon/i })).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('H-03 hero image has alt, dimensions and eager loading', () => {
    renderHome()
    const img = screen.getByRole('img', { name: /congee/i })
    expect(img).toHaveAttribute('width')
    expect(img).toHaveAttribute('height')
    expect(img).toHaveAttribute('loading', 'eager')
  })
})
