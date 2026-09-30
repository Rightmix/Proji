import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Homepage', () => {
  it('H-01 single h1 and CTAs to /build and /menu', () => {
    renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /build your bowl/i })).toHaveAttribute('href', '/build')
    expect(screen.getByRole('link', { name: /view menu/i })).toHaveAttribute('href', '/menu')
  })

  it('H-02 contains no nutrition figures, prices or health claims', () => {
    const { container } = renderHome()
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/₹|\brs\.?\s*\d|\d+\s*(kcal|cal|g)\b/i)
    expect(text).not.toMatch(
      /\b(cure|treat|heal|detox|weight[- ]loss|diabet|immunity|clinically|guaranteed)\w*/i,
    )
  })

  it('H-03 hero image has alt, dimensions and eager loading', () => {
    renderHome()
    const img = screen.getByRole('img', { name: /congee/i })
    expect(img).toHaveAttribute('width')
    expect(img).toHaveAttribute('height')
    expect(img).toHaveAttribute('loading', 'eager')
  })
})
