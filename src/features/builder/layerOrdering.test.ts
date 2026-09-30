import { defaultIngredientIndex as IDX } from './ingredientRepository'
import { buildLayers } from './layerOrdering'
import { EMPTY_SELECTION } from './selectionRules'

describe('layer ordering', () => {
  it('empty selection → no layers', () => expect(buildLayers(EMPTY_SELECTION, IDX)).toEqual([]))
  it('full bowl: deterministic z-order base < protein < flavours < toppings, distinct slot rotations', () => {
    const layers = buildLayers(
      {
        base: 'base.millet-kanji',
        protein: 'protein.roasted-soya-chunks',
        flavours: ['flavour.garlic-tadka', 'flavour.herb-mint-sauce'],
        toppings: ['topping.fresh-herbs', 'topping.roasted-peanuts', 'topping.pickled-vegetables'],
      },
      IDX,
    )
    expect(layers.map((l) => l.category)).toEqual([
      'base',
      'protein',
      'flavour',
      'flavour',
      'topping',
      'topping',
      'topping',
    ])
    const z = layers.map((l) => l.zIndex)
    expect([...z].sort((a, b) => a - b)).toEqual(z)
    expect(new Set(z).size).toBe(z.length)
    expect(layers.filter((l) => l.category === 'flavour').map((l) => l.rotation)).toEqual([0, 180])
    expect(layers.filter((l) => l.category === 'topping').map((l) => l.rotation)).toEqual([
      60, 180, 300,
    ])
    expect(new Set(layers.map((l) => l.key)).size).toBe(7)
  })
  it('animation presets follow the spec durations', () => {
    const l = buildLayers(
      {
        ...EMPTY_SELECTION,
        base: 'base.millet-kanji',
        protein: 'protein.boiled-egg',
        flavours: ['flavour.garlic-tadka', null],
        toppings: ['topping.fresh-herbs', null, null],
      },
      IDX,
    )
    expect(l.map((x) => x.animation.durationMs)).toEqual([600, 500, 700, 500])
  })
})
