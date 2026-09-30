import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Button, ButtonLink, ResponsiveImage, SelectableCard, SelectableGroup, StatTile } from '.'
import type { ImageAsset } from '../../lib/assets'

describe('C-01 Button / ButtonLink', () => {
  it('fires onClick, blocks when disabled, meets touch height class', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Next</Button>)
    const btn = screen.getByRole('button', { name: 'Next' })
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn.className).toMatch(/min-h-touch/)
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(
      <Button onClick={onClick} disabled>
        Next
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it.each(['primary', 'secondary', 'ghost', 'inverse'] as const)('renders %s variant', (v) => {
    render(<Button variant={v}>X</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('ButtonLink navigates', async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ButtonLink to="/build">Build</ButtonLink>} />
          <Route path="/build" element={<p>builder page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Build' }))
    expect(screen.getByText('builder page')).toBeInTheDocument()
  })
})

function Harness({
  mode,
  max,
  disabledValue,
}: {
  mode: 'single' | 'multiple'
  max?: number
  disabledValue?: string
}) {
  const [value, setValue] = useState<string[]>([])
  return (
    <>
      <SelectableGroup
        legend="Choose"
        hint="Pick"
        mode={mode}
        max={max}
        value={value}
        onChange={setValue}
      >
        {['a', 'b', 'c'].map((v) => (
          <SelectableCard
            key={v}
            value={v}
            title={`Option ${v}`}
            description="desc"
            disabled={v === disabledValue}
          />
        ))}
      </SelectableGroup>
      <output data-testid="value">{value.join(',')}</output>
    </>
  )
}

describe('C-02 SelectableCard semantics', () => {
  it('single mode uses radios; click and keyboard select exactly one', async () => {
    const user = userEvent.setup()
    render(<Harness mode="single" />)
    expect(screen.getByRole('group', { name: 'Choose' })).toBeInTheDocument()
    const a = screen.getByRole('radio', { name: /option a/i })
    const b = screen.getByRole('radio', { name: /option b/i })
    await user.click(a)
    expect(a).toBeChecked()
    await user.click(b)
    expect(b).toBeChecked()
    expect(a).not.toBeChecked()
    expect(screen.getByTestId('value')).toHaveTextContent(/^b$/)
    b.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: /option c/i })).toBeChecked()
  })

  it('multiple mode uses checkboxes; Space toggles on and off', async () => {
    const user = userEvent.setup()
    render(<Harness mode="multiple" />)
    const a = screen.getByRole('checkbox', { name: /option a/i })
    a.focus()
    await user.keyboard(' ')
    expect(a).toBeChecked()
    await user.keyboard(' ')
    expect(a).not.toBeChecked()
  })

  it('disabled card cannot be selected', async () => {
    render(<Harness mode="single" disabledValue="b" />)
    const b = screen.getByRole('radio', { name: /option b/i })
    expect(b).toBeDisabled()
    await userEvent.click(b)
    expect(b).not.toBeChecked()
  })
})

describe('C-03 SelectableGroup max', () => {
  it('blocks new selections at max but keeps selected ones removable', async () => {
    const user = userEvent.setup()
    render(<Harness mode="multiple" max={2} />)
    const [a, b, c] = ['a', 'b', 'c'].map((v) =>
      screen.getByRole('checkbox', { name: new RegExp(`option ${v}`, 'i') }),
    )
    await user.click(a)
    await user.click(b)
    expect(c).toBeDisabled()
    expect(a).toBeEnabled()
    fireEvent.click(c)
    expect(screen.getByTestId('value')).toHaveTextContent(/^a,b$/)
    await user.click(a)
    expect(c).toBeEnabled()
  })
})

describe('C-04 StatTile', () => {
  it('exposes value and label together; highlight is marked beyond colour', () => {
    render(<StatTile value="33g" label="Protein" highlight />)
    const tile = screen.getByRole('group', { name: '33g Protein' })
    expect(tile).toHaveAttribute('data-highlighted', 'true')
    expect(tile.className).toMatch(/border-select-500/)
    expect(tile.querySelector('span')?.className).toMatch(/font-bold/)
  })
})

describe('C-05 ResponsiveImage', () => {
  const asset: ImageAsset = {
    src: '/x.webp',
    alt: 'A bowl',
    width: 400,
    height: 300,
    status: 'approved',
  }
  it('sets alt + intrinsic size and lazy-loads by default', () => {
    render(<ResponsiveImage asset={asset} />)
    const img = screen.getByRole('img', { name: 'A bowl' })
    expect(img).toHaveAttribute('width', '400')
    expect(img).toHaveAttribute('height', '300')
    expect(img).toHaveAttribute('loading', 'lazy')
  })
  it('priority images load eagerly', () => {
    render(<ResponsiveImage asset={asset} priority />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })
  it('shows labelled fallback on error', () => {
    render(<ResponsiveImage asset={asset} />)
    fireEvent.error(screen.getByRole('img'))
    const fb = screen.getByRole('img', { name: 'A bowl' })
    expect(fb.tagName).toBe('DIV')
  })
})
