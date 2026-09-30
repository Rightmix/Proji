import { DEVELOPMENT_FIXTURE_BOWLS } from './fixtures'

describe('D-02 development fixtures carry no validated commercial/nutrition data', () => {
  it.each(DEVELOPMENT_FIXTURE_BOWLS.map((b) => [b.slug, b]))('%s', (_s, b) => {
    expect(b.dataStatus).toBe('development-fixture')
    expect(b.nutrition).toEqual({ status: 'unavailable' })
    expect(b.price).toEqual({ status: 'unavailable' })
    expect(b.allergens).toEqual({ status: 'unavailable' })
    expect(b.recipeVersionId).toBeNull()
    const text = `${b.name} ${b.summary} ${b.description}`
    expect(text).not.toMatch(
      /₹|\d+\s*(kcal|cal|g)\b|high[- ]protein|healthy|low[- ]?(fat|carb|gi)|cure|immunity|weight/i,
    )
  })
})
