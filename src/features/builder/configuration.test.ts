import { defaultIngredientIndex as IDX } from './ingredientRepository'
import { fromSearchParams, toConfiguration, toSearchParams } from './configuration'
import { EMPTY_SELECTION } from './selectionRules'
import type { Selection } from './types'

const full: Selection = {
  base: 'base.red-rice-kanji',
  protein: 'protein.pepper-chicken',
  flavours: [null, 'flavour.spicy-chilli-oil'],
  toppings: ['topping.fresh-herbs', null, 'topping.roasted-peanuts'],
}

describe('configuration boundary (Stage 5/6)', () => {
  it('null until base + protein', () => expect(toConfiguration(EMPTY_SELECTION)).toBeNull())
  it('ids only, compacted', () => {
    expect(toConfiguration(full)).toEqual({
      version: 1,
      baseId: 'base.red-rice-kanji',
      proteinId: 'protein.pepper-chicken',
      flavourIds: ['flavour.spicy-chilli-oil'],
      toppingIds: ['topping.fresh-herbs', 'topping.roasted-peanuts'],
    })
  })
})

describe('P-07 share params round-trip', () => {
  it('encodes slugs and restores an equivalent bowl', () => {
    const p = toSearchParams(full)
    expect(p.toString()).toBe(
      'base=red-rice-kanji&protein=pepper-chicken&flavours=spicy-chilli-oil&toppings=fresh-herbs%2Croasted-peanuts',
    )
    const back = fromSearchParams(p, IDX)!
    expect(toConfiguration(back)).toEqual(toConfiguration(full))
  })
  it('no params → null; junk sanitized', () => {
    expect(fromSearchParams(new URLSearchParams('bowl=x'), IDX)).toBeNull()
    const s = fromSearchParams(
      new URLSearchParams(
        'base=pizza&toppings=fresh-herbs,fresh-herbs,x,roasted-peanuts,crispy-shallots,pickled-vegetables',
      ),
      IDX,
    )!
    expect(s.base).toBeNull()
    expect(s.toppings).toEqual([
      'topping.fresh-herbs',
      'topping.roasted-peanuts',
      'topping.crispy-shallots',
    ])
  })
})
