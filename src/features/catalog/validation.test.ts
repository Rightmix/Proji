import { DEVELOPMENT_FIXTURE_BOWLS } from './fixtures'
import type { SignatureBowl } from './types'
import { validateCatalog } from './validation'

const base = DEVELOPMENT_FIXTURE_BOWLS[0]
const clone = (patch: Partial<SignatureBowl>): SignatureBowl => ({ ...base, ...patch })

describe('D-01 catalog integrity', () => {
  it('fixtures are valid', () => {
    expect(validateCatalog(DEVELOPMENT_FIXTURE_BOWLS)).toEqual([])
  })
  it('rejects duplicate ids and slugs, bad slugs', () => {
    expect(validateCatalog([base, clone({})]).join()).toMatch(/duplicate id/)
    expect(validateCatalog([base, clone({ id: 'x' })]).join()).toMatch(/duplicate slug/)
    expect(validateCatalog([clone({ slug: 'Bad Slug' })]).join()).toMatch(
      /invalid or duplicate slug/,
    )
  })
  it('requires base and protein components', () => {
    const errs = validateCatalog([
      clone({ components: [{ ingredientId: 'topping.x', name: 'x', role: 'topping' }] }),
    ])
    expect(errs.join()).toMatch(/needs a base/)
    expect(errs.join()).toMatch(/needs a protein/)
  })
  it('rejects unknown families', () => {
    expect(validateCatalog([clone({ baseFamily: 'sand' as never })]).join()).toMatch(
      /unknown base family/,
    )
    expect(validateCatalog([clone({ proteinType: 'unicorn' as never })]).join()).toMatch(
      /unknown protein type/,
    )
  })
})

describe('D-03 validated values need provenance; fixtures cannot claim them', () => {
  const nutrition = {
    status: 'validated',
    value: { energyKcal: 1, proteinG: 1, carbsG: 1, fatG: 1, servingG: 1 },
    source: 'lab',
    validatedAt: '2026-10-01',
  } as const
  it('fixture with validated nutrition is rejected', () => {
    expect(validateCatalog([clone({ nutrition })]).join()).toMatch(
      /fixtures must not carry validated/,
    )
  })
  it('validated bowl needs source, date and recipe version', () => {
    const errs = validateCatalog([
      clone({
        dataStatus: 'validated',
        price: {
          status: 'validated',
          value: { amountMinor: 1, currency: 'INR' },
          source: '',
          validatedAt: 'nope',
        },
      }),
    ]).join()
    expect(errs).toMatch(/requires a source/)
    expect(errs).toMatch(/requires validatedAt/)
    expect(errs).toMatch(/requires recipeVersionId/)
  })
  it('properly validated bowl passes', () => {
    expect(
      validateCatalog([clone({ dataStatus: 'validated', recipeVersionId: 'rv-1', nutrition })]),
    ).toEqual([])
  })
})

describe('D-04 Stage 4 ingredient id convention', () => {
  it('rejects ids that do not match role', () => {
    const errs = validateCatalog([
      clone({
        components: [
          { ingredientId: 'base.brown-rice-kanji', name: 'b', role: 'base' },
          { ingredientId: 'topping.pepper-chicken', name: 'p', role: 'protein' },
        ],
      }),
    ])
    expect(errs.join()).toMatch(/must be "protein\.<slug>"/)
  })
  it('all fixture ids follow role.slug', () => {
    for (const b of DEVELOPMENT_FIXTURE_BOWLS)
      for (const c of b.components)
        expect(c.ingredientId).toMatch(new RegExp(`^${c.role}\\.[a-z0-9-]+$`))
  })
})
