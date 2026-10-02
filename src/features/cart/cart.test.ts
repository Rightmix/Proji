import { addToCart, cartStore, removeFromCart, setQuantity } from './cartStore'
import { priceCart } from './cartTotals'
import { defaultIngredientIndex as IDX } from '../builder/ingredientRepository'
import type { BowlConfiguration } from '../builder/types'

const cfg: BowlConfiguration = {
  version: 1,
  baseId: 'base.brown-rice-kanji',
  proteinId: 'protein.kerala-grilled-fish',
  flavourIds: [],
  toppingIds: [],
}

describe('prototype cart', () => {
  beforeEach(() => cartStore.set([]))
  it('adds, merges identical items, clamps quantity, removes', () => {
    addToCart({ name: 'A', mealSlug: null, configuration: cfg })
    addToCart({ name: 'A', mealSlug: null, configuration: cfg })
    expect(cartStore.get()).toHaveLength(1)
    expect(cartStore.get()[0].quantity).toBe(2)
    const id = cartStore.get()[0].id
    setQuantity(id, 0)
    expect(cartStore.get()[0].quantity).toBe(1)
    setQuantity(id, 99)
    expect(cartStore.get()[0].quantity).toBe(20)
    removeFromCart(id)
    expect(cartStore.get()).toEqual([])
  })
  it('totals are recomputed from the ingredient source (stored values are never trusted)', () => {
    cartStore.set([
      {
        id: '1',
        name: 'X',
        mealSlug: null,
        configuration: { ...cfg },
        quantity: 2,
        priceMinor: 1,
      } as never,
    ])
    const t = priceCart(cartStore.get(), IDX)
    expect(t.subtotalMinor).toBe(2 * 27000)
    expect(t.nutrition.energyKcal).toBe(2 * 400)
    expect(t.nutrition.proteinG).toBe(66)
  })
  it('stale or corrupted lines are flagged and excluded from totals', () => {
    cartStore.set([
      {
        id: '1',
        name: 'Old',
        mealSlug: null,
        configuration: { ...cfg, proteinId: 'protein.lobster' },
        quantity: 1,
      },
      { id: '2', name: 'Bad', mealSlug: null, configuration: { hacked: true }, quantity: 1 },
    ])
    const t = priceCart(cartStore.get(), IDX)
    expect(t.lines.map((l) => l.status)).toEqual(['unavailable', 'unavailable'])
    expect(t.hasUnavailable).toBe(true)
    expect(t.subtotalMinor).toBe(0)
  })
  it('malformed localStorage is ignored safely', () => {
    localStorage.setItem('proji-cart', '{"not":"an array"}')
    cartStore.reset()
    expect(cartStore.get()).toEqual([])
  })
})
