import { DEVELOPMENT_FIXTURE_BOWLS as B } from '../catalog/fixtures'
import { defaultIngredientIndex as IDX } from '../builder/ingredientRepository'
import { estimateBowl } from './mealEstimate'
import { MEAL_CATEGORIES, findCategory, matchesSearch } from './categories'
import { favouritesStore, toggleFavourite } from './favourites'

const bowl = (slug: string) => B.find((b) => b.slug === slug)!

describe('meal estimates (D-024)', () => {
  it('builder-composed sample → illustrative sum of builder fixture values', () => {
    const e = estimateBowl(bowl('pepper-chicken-brown-rice-bowl'), IDX)
    expect(e.status).toBe('illustrative')
    if (e.status !== 'illustrative') return
    // 220+200+45+45+10 kcal; 5+30+0+1+0 g protein; ₹120+140+20+20+10
    expect(e.nutrition).toMatchObject({
      energyKcal: 520,
      proteinG: 36,
      dataStatus: 'illustrative-fixture',
    })
    expect(e.priceMinor).toBe(31000)
    expect(e.configuration.toppingIds).toEqual(['topping.crispy-shallots', 'topping.fresh-herbs'])
  })
  it('bowls with any non-builder component stay pending (no partial numbers)', () => {
    for (const slug of [
      'kerala-pepper-chicken-kanji',
      'coconut-fish-millet-kanji',
      'tandoori-paneer-red-rice-kanji',
      'kerala-beef-roast-quinoa-bowl',
    ])
      expect(estimateBowl(bowl(slug), IDX).status).toBe('pending')
  })
  it('never touches the validated Verified<T> fields', () => {
    for (const b of B) {
      estimateBowl(b, IDX)
      expect(b.price).toEqual({ status: 'unavailable' })
      expect(b.nutrition).toEqual({ status: 'unavailable' })
    }
  })
})

describe('categories and search', () => {
  it('protein/base categories', () => {
    const ids = (id: string) =>
      B.filter((b) => findCategory(id)!.matches(b, estimateBowl(b, IDX))).map((b) => b.slug)
    expect(ids('fish')).toEqual(['coconut-fish-millet-kanji', 'grilled-fish-millet-bowl'])
    expect(ids('rice')).toContain('chilli-soya-red-rice-bowl')
    expect(ids('rice')).not.toContain('kerala-beef-roast-quinoa-bowl')
    expect(
      ids('high-protein').every((s) => {
        const e = estimateBowl(bowl(s), IDX)
        return e.status === 'illustrative' && e.nutrition.proteinG >= 30
      }),
    ).toBe(true)
  })
  it('nutrition-based categories are flagged provisional', () => {
    for (const c of MEAL_CATEGORIES.filter((c) => ['high-protein', 'low-carb'].includes(c.id)))
      expect(c.note).toMatch(/provisional/i)
  })
  it('search matches name and component names, case-insensitive', () => {
    expect(matchesSearch(bowl('grilled-fish-millet-bowl'), 'MINT')).toBe(true)
    expect(matchesSearch(bowl('grilled-fish-millet-bowl'), 'paneer')).toBe(false)
    expect(matchesSearch(bowl('grilled-fish-millet-bowl'), '  ')).toBe(true)
  })
})

describe('favourites (device-local)', () => {
  beforeEach(() => favouritesStore.set([]))
  it('toggle on/off and persists to localStorage', () => {
    toggleFavourite('a')
    expect(favouritesStore.get()).toEqual(['a'])
    expect(JSON.parse(localStorage.getItem('proji-favourites')!)).toEqual(['a'])
    toggleFavourite('a')
    expect(favouritesStore.get()).toEqual([])
  })
})
