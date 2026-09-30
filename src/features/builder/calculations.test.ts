import { defaultIngredientIndex as IDX } from './ingredientRepository'
import { computeNutrition } from './nutrition'
import { computePrice, formatAddOn, formatInr } from './pricing'
import { EMPTY_SELECTION } from './selectionRules'
import type { Selection } from './types'

const S = (p: Partial<Selection>): Selection => ({ ...EMPTY_SELECTION, ...p })
const master = S({
  base: 'base.brown-rice-kanji',
  protein: 'protein.kerala-grilled-fish',
  flavours: ['flavour.kerala-coconut-sauce', null],
  toppings: ['topping.roasted-peanuts', 'topping.crispy-shallots', null],
})

describe('C-01 nutrition', () => {
  it('empty bowl is zero', () => {
    expect(computeNutrition(EMPTY_SELECTION, IDX)).toMatchObject({
      energyKcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    })
  })
  it.each(IDX.source.ingredients.map((i) => [i.id, i]))(
    '%s alone contributes exactly its values',
    (_id, i) => {
      const base = 'base.brown-rice-kanji'
      const b = IDX.byId.get(base)!.values
      const sel =
        i.category === 'base'
          ? S({ base: i.id })
          : i.category === 'protein'
            ? S({ base, protein: i.id })
            : i.category === 'flavour'
              ? S({ base, flavours: [i.id, null] })
              : S({ base, toppings: [i.id, null, null] })
      const n = computeNutrition(sel, IDX)
      const extra = i.category === 'base' ? { energyKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 } : b
      expect(n.energyKcal).toBe(i.values.energyKcal + extra.energyKcal)
      expect(n.proteinG).toBe(i.values.proteinG + extra.proteinG)
      expect(n.carbsG).toBe(i.values.carbsG + extra.carbsG)
      expect(n.fatG).toBe(i.values.fatG + extra.fatG)
    },
  )
  it('master scenario totals', () => {
    expect(computeNutrition(master, IDX)).toEqual({
      energyKcal: 585,
      proteinG: 38,
      carbsG: 55,
      fatG: 25,
      dataStatus: 'illustrative-fixture',
    })
  })
  it('every 2-flavour × 3-topping combination sums correctly', () => {
    const f = IDX.byCategory.flavour.map((i) => i.id)
    const t = IDX.byCategory.topping.map((i) => i.id)
    let checked = 0
    for (let a = 0; a < f.length; a++)
      for (let b = a + 1; b < f.length; b++)
        for (let x = 0; x < t.length; x++)
          for (let y = x + 1; y < t.length; y++)
            for (let z = y + 1; z < t.length; z++) {
              const ids = [
                'base.red-rice-kanji',
                'protein.boiled-egg',
                f[a],
                f[b],
                t[x],
                t[y],
                t[z],
              ]
              const s = S({
                base: ids[0],
                protein: ids[1],
                flavours: [f[a], f[b]],
                toppings: [t[x], t[y], t[z]],
              })
              const want = ids.reduce((k, id) => k + IDX.byId.get(id)!.values.energyKcal, 0)
              expect(computeNutrition(s, IDX).energyKcal).toBe(want)
              checked++
            }
    expect(checked).toBe(6 * 4)
  })
})

describe('C-02 pricing', () => {
  it('empty ₹0, base only ₹120, master ₹340', () => {
    expect(computePrice(EMPTY_SELECTION, IDX).amountMinor).toBe(0)
    expect(computePrice(S({ base: 'base.brown-rice-kanji' }), IDX).amountMinor).toBe(12000)
    expect(
      computePrice(
        S({ base: 'base.brown-rice-kanji', protein: 'protein.kerala-grilled-fish' }),
        IDX,
      ).amountMinor,
    ).toBe(27000)
    expect(computePrice(master, IDX)).toEqual({
      amountMinor: 34000,
      currency: 'INR',
      dataStatus: 'illustrative-fixture',
    })
  })
  it('formats rupees', () => {
    expect(formatInr(34000)).toBe('₹340')
    expect(formatInr(0)).toBe('₹0')
    expect(formatAddOn(15000)).toBe('+₹150')
  })
})
