import { DEVELOPMENT_FIXTURE_BOWLS as B } from './fixtures'
import {
  NO_FILTERS,
  applyFilters,
  deriveOptions,
  filtersFromParams,
  filtersToParams,
} from './filters'

const slugs = (x: { slug: string }[]) => x.map((b) => b.slug)

describe('F-01 filtering', () => {
  it('no filters returns all', () => expect(applyFilters(B, NO_FILTERS)).toHaveLength(B.length))
  it('by base', () =>
    expect(slugs(applyFilters(B, { ...NO_FILTERS, base: 'millet' }))).toEqual([
      'coconut-fish-millet-kanji',
    ]))
  it('by protein', () =>
    expect(slugs(applyFilters(B, { ...NO_FILTERS, protein: 'vegetarian' }))).toEqual([
      'tandoori-paneer-red-rice-kanji',
    ]))
  it('combined filters intersect', () => {
    expect(applyFilters(B, { ...NO_FILTERS, base: 'millet', protein: 'chicken' })).toEqual([])
    expect(applyFilters(B, { ...NO_FILTERS, base: 'brown-rice', protein: 'chicken' })).toHaveLength(
      1,
    )
  })
})

describe('F-02 options derived from data', () => {
  it('lists only families present, in registry order', () => {
    const o = deriveOptions(B)
    expect(o.base.map((x) => x.value)).toEqual(['red-rice', 'brown-rice', 'millet', 'quinoa'])
    expect(o.protein.map((x) => x.value)).toEqual(['chicken', 'fish', 'beef', 'vegetarian'])
    expect(o.base.find((x) => x.value === 'quinoa')?.label).toBe('Quinoa')
  })
  it('empty catalog yields no options', () =>
    expect(deriveOptions([])).toEqual({ base: [], protein: [] }))
})

describe('F-03 availability filter', () => {
  it('hides sold-out and coming-soon', () => {
    const r = applyFilters(B, { ...NO_FILTERS, availableOnly: true })
    expect(r.every((b) => b.availability.state === 'available')).toBe(true)
    expect(r).toHaveLength(2)
  })
})

describe('F-04 URL params', () => {
  it('round-trips', () => {
    const f = { base: 'quinoa', protein: 'beef', availableOnly: true } as const
    expect(filtersFromParams(filtersToParams(f))).toEqual(f)
  })
  it('ignores invalid values', () => {
    expect(filtersFromParams(new URLSearchParams('base=sand&protein=<x>&available=yes'))).toEqual(
      NO_FILTERS,
    )
  })
})
