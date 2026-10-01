import { indexIngredients, defaultIngredientIndex as IDX } from './ingredientRepository'
import { ILLUSTRATIVE_INGREDIENTS } from './illustrativeIngredients'
import { decodeConfiguration, encodeConfiguration, describeMissing } from './savedBowlCodec'
import { toConfiguration } from './configuration'
import type { BowlConfiguration } from './types'

const valid: BowlConfiguration = {
  version: 1,
  baseId: 'base.brown-rice-kanji',
  proteinId: 'protein.kerala-grilled-fish',
  flavourIds: ['flavour.kerala-coconut-sauce', 'flavour.spicy-chilli-oil'],
  toppingIds: ['topping.roasted-peanuts', 'topping.crispy-shallots', 'topping.fresh-herbs'],
}
const json = (x: unknown) => JSON.parse(JSON.stringify(x))

describe('B-01 round-trip', () => {
  it('encode → JSON → decode restores the same configuration and selection', () => {
    const r = decodeConfiguration(json(encodeConfiguration(valid)), IDX)
    expect(r.status).toBe('ok')
    if (r.status !== 'ok') return
    expect(r.configuration).toEqual(valid)
    expect(toConfiguration(r.selection)).toEqual(valid)
  })
  it('minimal bowl (no flavours/toppings)', () => {
    const r = decodeConfiguration({ ...valid, flavourIds: [], toppingIds: [] }, IDX)
    expect(r.status).toBe('ok')
  })
  it('encode copies arrays (no aliasing) and carries IDs only', () => {
    const e = encodeConfiguration(valid)
    expect(e.flavourIds).not.toBe(valid.flavourIds)
    expect(Object.keys(e).sort()).toEqual([
      'baseId',
      'flavourIds',
      'proteinId',
      'toppingIds',
      'version',
    ])
  })
})

describe('B-02 malformed payloads', () => {
  it.each([
    ['null', null],
    ['string', 'base.brown-rice-kanji'],
    ['array', [valid]],
    ['missing key', { ...valid, toppingIds: undefined }],
    ['extra key (e.g. client price)', { ...valid, priceMinor: 1 }],
    ['wrong version', { ...valid, version: 2 }],
    ['version as string', { ...valid, version: '1' }],
    ['base not string', { ...valid, baseId: 7 }],
    ['flavours not array', { ...valid, flavourIds: 'flavour.garlic-tadka' }],
    ['injection-like id', { ...valid, proteinId: 'protein.x"; drop table' }],
  ])('%s → invalid', (_n, raw) => {
    expect(decodeConfiguration(raw, IDX).status).toBe('invalid')
  })
})

describe('B-05 limits and duplicates', () => {
  it('rejects 3 flavours, 4 toppings and duplicates', () => {
    expect(
      decodeConfiguration(
        { ...valid, flavourIds: [...valid.flavourIds, 'flavour.garlic-tadka'] },
        IDX,
      ),
    ).toMatchObject({
      status: 'invalid',
      reason: expect.stringMatching(/limit/),
    })
    expect(
      decodeConfiguration(
        { ...valid, toppingIds: [...valid.toppingIds, 'topping.pickled-vegetables'] },
        IDX,
      ).status,
    ).toBe('invalid')
    expect(
      decodeConfiguration(
        { ...valid, toppingIds: ['topping.fresh-herbs', 'topping.fresh-herbs'] },
        IDX,
      ),
    ).toMatchObject({
      reason: expect.stringMatching(/duplicate/),
    })
  })
})

describe('B-03 unknown ids', () => {
  it('reports unknown ids and keeps the rest; never substitutes', () => {
    const r = decodeConfiguration(
      {
        ...valid,
        proteinId: 'protein.lobster',
        toppingIds: ['topping.gold-leaf', 'topping.fresh-herbs'],
      },
      IDX,
    )
    expect(r.status).toBe('stale')
    if (r.status !== 'stale') return
    expect(r.missing).toEqual([
      { id: 'protein.lobster', category: 'protein', reason: 'unknown' },
      { id: 'topping.gold-leaf', category: 'topping', reason: 'unknown' },
    ])
    expect(r.selection.protein).toBeNull()
    expect(r.selection.toppings).toEqual(['topping.fresh-herbs', null, null])
    expect(r.selection.base).toBe(valid.baseId)
    expect(describeMissing(r.missing[0], IDX)).toBe('lobster')
  })
})

describe('B-04 unavailable ingredients', () => {
  it('excludes and reports items the availability check rejects', () => {
    const r = decodeConfiguration(valid, IDX, {
      isAvailable: (id) => id !== 'flavour.spicy-chilli-oil',
    })
    expect(r).toMatchObject({
      status: 'stale',
      missing: [{ id: 'flavour.spicy-chilli-oil', reason: 'unavailable' }],
    })
    if (r.status === 'stale')
      expect(r.selection.flavours).toEqual(['flavour.kerala-coconut-sauce', null])
  })
})

describe('B-06 old saved configuration after the ingredient list changes', () => {
  it('a later index without Millet/Garlic Tadka restores only valid parts', () => {
    const later = indexIngredients({
      dataStatus: 'illustrative-fixture',
      ingredients: ILLUSTRATIVE_INGREDIENTS.filter(
        (i) => i.id !== 'base.millet-kanji' && i.id !== 'flavour.garlic-tadka',
      ),
    })
    const old = { ...valid, baseId: 'base.millet-kanji', flavourIds: ['flavour.garlic-tadka'] }
    const r = decodeConfiguration(old, later)
    expect(r.status).toBe('stale')
    if (r.status !== 'stale') return
    expect(r.missing.map((m) => m.id)).toEqual(['base.millet-kanji', 'flavour.garlic-tadka'])
    expect(r.selection.base).toBeNull()
    expect(r.selection.protein).toBe(valid.proteinId)
    expect(describeMissing(r.missing[0], later)).toBe('millet kanji')
  })
})
