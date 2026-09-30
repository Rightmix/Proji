import { act, fireEvent, render, screen } from '@testing-library/react'
import { BowlRenderer } from './BowlRenderer'
import { buildLayers } from '../../features/builder/layerOrdering'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import { EMPTY_SELECTION, createReducer, initialState } from '../../features/builder/selectionRules'
import type { Selection } from '../../features/builder/types'

const layersOf = (s: Selection) => buildLayers(s, IDX)
const domLayers = () =>
  screen
    .queryAllByTestId('bowl-layer')
    .map((el) => `${el.dataset.category}:${el.dataset.slot}:${el.dataset.ingredient}`)
const loadAll = () =>
  document.querySelectorAll('[data-testid="bowl-layer"] img').forEach((img) => fireEvent.load(img))
const base = 'base.brown-rice-kanji'

describe('BowlRenderer', () => {
  it('R-01 empty bowl shows the prompt and no layers', () => {
    render(<BowlRenderer layers={[]} reducedMotion={false} />)
    expect(screen.getByText(/your bowl builds here/i)).toBeInTheDocument()
    expect(domLayers()).toEqual([])
    expect(screen.getByRole('img', { name: 'Your bowl is empty' })).toBeInTheDocument()
  })

  it.each(IDX.source.ingredients.map((i) => [i.id, i]))(
    'R-02 %s renders exactly one correct layer',
    (_id, i) => {
      const s: Selection =
        i.category === 'base'
          ? { ...EMPTY_SELECTION, base: i.id }
          : i.category === 'protein'
            ? { ...EMPTY_SELECTION, base, protein: i.id }
            : i.category === 'flavour'
              ? { ...EMPTY_SELECTION, base, protein: 'protein.boiled-egg', flavours: [i.id, null] }
              : {
                  ...EMPTY_SELECTION,
                  base,
                  protein: 'protein.boiled-egg',
                  toppings: [i.id, null, null],
                }
      render(<BowlRenderer layers={layersOf(s)} reducedMotion />)
      const mine = screen
        .getAllByTestId('bowl-layer')
        .filter((el) => el.dataset.ingredient === i.id)
      expect(mine).toHaveLength(1)
      expect(mine[0].querySelector('img')).toHaveAttribute('src', i.layerSrc)
      expect(screen.getByRole('img', { name: new RegExp(i.name) })).toBeInTheDocument()
    },
  )

  it('R-03 replacement removes the obsolete layer; removal clears it', () => {
    const s1 = { ...EMPTY_SELECTION, base, protein: 'protein.kerala-grilled-fish' }
    const { rerender } = render(<BowlRenderer layers={layersOf(s1)} reducedMotion={false} />)
    rerender(
      <BowlRenderer
        layers={layersOf({ ...s1, base: 'base.red-rice-kanji', protein: 'protein.pepper-chicken' })}
        reducedMotion={false}
      />,
    )
    expect(domLayers()).toEqual(['base:0:base.red-rice-kanji', 'protein:0:protein.pepper-chicken'])
    rerender(
      <BowlRenderer
        layers={layersOf({ ...EMPTY_SELECTION, base: 'base.red-rice-kanji' })}
        reducedMotion={false}
      />,
    )
    expect(domLayers()).toEqual(['base:0:base.red-rice-kanji'])
  })

  it('R-04 two flavours + three toppings coexist above the protein', () => {
    const s: Selection = {
      base,
      protein: 'protein.kerala-grilled-fish',
      flavours: ['flavour.kerala-coconut-sauce', 'flavour.spicy-chilli-oil'],
      toppings: ['topping.roasted-peanuts', 'topping.crispy-shallots', 'topping.fresh-herbs'],
    }
    render(<BowlRenderer layers={layersOf(s)} reducedMotion />)
    const els = screen.getAllByTestId('bowl-layer')
    expect(els).toHaveLength(7)
    const z = (cat: string) =>
      els.filter((e) => e.dataset.category === cat).map((e) => Number(e.style.zIndex))
    expect(Math.min(...z('protein'))).toBeGreaterThan(Math.max(...z('base')))
    expect(Math.min(...z('flavour'))).toBeGreaterThan(Math.max(...z('protein')))
    expect(Math.min(...z('topping'))).toBeGreaterThan(Math.max(...z('flavour')))
  })

  it('R-05 rapid random changes end with DOM == final selection (no stale/duplicate layers)', () => {
    const reduce = createReducer(IDX)
    const ids = IDX.source.ingredients.map((i) => i.id)
    let st = reduce(reduce(initialState(), { type: 'select', id: base }), {
      type: 'select',
      id: 'protein.boiled-egg',
    })
    const { rerender } = render(
      <BowlRenderer layers={layersOf(st.selection)} reducedMotion={false} />,
    )
    let seed = 7
    for (let k = 0; k < 120; k++) {
      seed = (seed * 16807) % 2147483647
      st = reduce(st, { type: 'select', id: ids[seed % ids.length] })
      rerender(<BowlRenderer layers={layersOf(st.selection)} reducedMotion={false} />)
      if (k % 7 === 0) loadAll() // some images finish loading mid-sequence
    }
    const want = layersOf(st.selection).map((l) => l.key)
    expect(domLayers()).toEqual(want)
    expect(new Set(domLayers()).size).toBe(domLayers().length)
  })

  it('R-06 slow load: hidden until decoded, then animates and settles', () => {
    vi.useFakeTimers()
    try {
      render(<BowlRenderer layers={layersOf({ ...EMPTY_SELECTION, base })} reducedMotion={false} />)
      const b = screen.getByTestId('bowl-layer')
      expect(b.dataset.phase).toBe('loading')
      act(() => vi.advanceTimersByTime(5000)) // still loading: no animation without the image
      expect(b.dataset.phase).toBe('loading')
      fireEvent.load(b.querySelector('img')!)
      expect(b.dataset.phase).toBe('entering')
      act(() => vi.advanceTimersByTime(700))
      expect(b.dataset.phase).toBe('entering')
      act(() => vi.advanceTimersByTime(100)) // 600ms preset + 150ms safety margin
      expect(b.dataset.phase).toBe('settled')
    } finally {
      vi.useRealTimers()
    }
  })

  it('R-06 load error shows a fallback shape', () => {
    render(
      <BowlRenderer
        layers={layersOf({ ...EMPTY_SELECTION, base: 'base.millet-kanji' })}
        reducedMotion={false}
      />,
    )
    const m = screen.getByTestId('bowl-layer')
    fireEvent.error(m.querySelector('img')!)
    expect(m.dataset.phase).toBe('error')
    expect(m.querySelector('[data-testid="layer-fallback"]')).toBeInTheDocument()
  })

  it('R-07 reduced motion: settles on load without animating', () => {
    render(<BowlRenderer layers={layersOf({ ...EMPTY_SELECTION, base })} reducedMotion />)
    const l = screen.getByTestId('bowl-layer')
    fireEvent.load(l.querySelector('img')!)
    expect(l.dataset.phase).toBe('settled')
  })
})
