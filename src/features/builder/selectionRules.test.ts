import { defaultIngredientIndex as IDX } from './ingredientRepository'
import {
  canAdvance,
  canVisit,
  createReducer,
  filled,
  initialState,
  sanitizeSelection,
  type BuilderAction,
} from './selectionRules'
import type { BuilderState } from './types'

const reduce = createReducer(IDX)
const run = (actions: BuilderAction[], s: BuilderState = initialState()) =>
  actions.reduce(reduce, s)
const sel = (id: string): BuilderAction => ({ type: 'select', id })
const ready = run([sel('base.brown-rice-kanji'), sel('protein.kerala-grilled-fish')])

describe('S-01 base and protein are single-select', () => {
  it('replaces the base and protein', () => {
    const s = run([
      sel('base.brown-rice-kanji'),
      sel('base.millet-kanji'),
      sel('protein.boiled-egg'),
      sel('protein.pepper-chicken'),
    ])
    expect(s.selection.base).toBe('base.millet-kanji')
    expect(s.selection.protein).toBe('protein.pepper-chicken')
  })
  it('re-selecting the same base keeps exactly one (no deselect to zero)', () => {
    const s = run([sel('base.brown-rice-kanji'), sel('base.brown-rice-kanji')])
    expect(s.selection.base).toBe('base.brown-rice-kanji')
  })
})

describe('S-02 limits', () => {
  it('flavours max 2 with notice on the third', () => {
    const s = run(
      ['kerala-coconut-sauce', 'spicy-chilli-oil', 'garlic-tadka'].map((x) => sel(`flavour.${x}`)),
      ready,
    )
    expect(filled(s.selection.flavours)).toEqual([
      'flavour.kerala-coconut-sauce',
      'flavour.spicy-chilli-oil',
    ])
    expect(s.notice).toEqual({ category: 'flavour', attemptedId: 'flavour.garlic-tadka' })
  })
  it('toppings max 3 with notice on the fourth', () => {
    const t = ['roasted-peanuts', 'crispy-shallots', 'fresh-herbs', 'pickled-vegetables'].map((x) =>
      sel(`topping.${x}`),
    )
    const s = run(t, ready)
    expect(filled(s.selection.toppings)).toHaveLength(3)
    expect(filled(s.selection.toppings)).not.toContain('topping.pickled-vegetables')
    expect(s.notice?.category).toBe('topping')
  })
  it('a successful selection clears the notice', () => {
    let s = run(
      ['kerala-coconut-sauce', 'spicy-chilli-oil', 'garlic-tadka'].map((x) => sel(`flavour.${x}`)),
      ready,
    )
    s = run([sel('flavour.spicy-chilli-oil')], s)
    expect(s.notice).toBeNull()
  })
})

describe('S-03 stable slots', () => {
  it('removing the middle topping leaves others in place and refills the gap', () => {
    let s = run(
      ['roasted-peanuts', 'crispy-shallots', 'fresh-herbs'].map((x) => sel(`topping.${x}`)),
      ready,
    )
    s = run([sel('topping.crispy-shallots')], s)
    expect(s.selection.toppings).toEqual(['topping.roasted-peanuts', null, 'topping.fresh-herbs'])
    s = run([sel('topping.pickled-vegetables')], s)
    expect(s.selection.toppings).toEqual([
      'topping.roasted-peanuts',
      'topping.pickled-vegetables',
      'topping.fresh-herbs',
    ])
  })
})

describe('S-04 gating', () => {
  it('cannot visit protein without base, or flavour/topping without protein', () => {
    const e = initialState().selection
    expect(canVisit(e, 'protein')).toBe(false)
    expect(run([{ type: 'goTo', step: 'topping' }]).step).toBe('base')
    expect(run([{ type: 'next' }]).step).toBe('base')
    const b = run([sel('base.millet-kanji')])
    expect(canAdvance(b.selection, 'base')).toBe(true)
    expect(canVisit(b.selection, 'flavour')).toBe(false)
    expect(run([{ type: 'next' }, { type: 'next' }], b).step).toBe('protein')
  })
  it('flavour/topping selection is ignored before base and protein', () => {
    expect(filled(run([sel('flavour.garlic-tadka')]).selection.flavours)).toEqual([])
  })
  it('topping is the last step', () => {
    expect(canAdvance(ready.selection, 'topping')).toBe(false)
  })
})

describe('S-05 back/forward preserves selections', () => {
  it('walks back to base and forward again with everything intact', () => {
    let s = run(
      [
        { type: 'next' },
        { type: 'next' },
        sel('flavour.herb-mint-sauce'),
        { type: 'next' },
        sel('topping.fresh-herbs'),
      ],
      ready,
    )
    expect(s.step).toBe('topping')
    const before = s.selection
    s = run([{ type: 'back' }, { type: 'back' }, { type: 'back' }, { type: 'back' }], s)
    expect(s.step).toBe('base')
    expect(s.selection).toEqual(before)
    s = run([{ type: 'goTo', step: 'topping' }], s)
    expect(s.step).toBe('topping')
    expect(s.selection).toEqual(before)
  })
})

describe('S-06 sanitisation', () => {
  it('drops unknown, misfiled and duplicate ids; enforces limits', () => {
    const s = sanitizeSelection(
      {
        base: 'protein.boiled-egg',
        protein: 'protein.nope',
        flavours: [
          'flavour.garlic-tadka',
          'flavour.garlic-tadka',
          'topping.fresh-herbs',
          'flavour.herb-mint-sauce',
          'flavour.spicy-chilli-oil',
        ],
        toppings: ['topping.fresh-herbs'],
      },
      IDX,
    )
    expect(s).toEqual({
      base: null,
      protein: null,
      flavours: ['flavour.garlic-tadka', 'flavour.herb-mint-sauce'],
      toppings: ['topping.fresh-herbs', null, null],
    })
  })
  it('unknown select action is a no-op', () => {
    expect(run([sel('base.pizza')], ready)).toBe(ready)
  })
})

describe('S-07 rapid random sequences: last requested configuration wins', () => {
  // Deterministic LCG so failures are reproducible.
  const rng = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32
  it('500 random 40-step sequences match an independent model', () => {
    const all = IDX.source.ingredients.map((i) => i.id)
    for (let run_ = 0; run_ < 500; run_++) {
      const r = rng(run_ + 1)
      let s = initialState()
      const model = {
        base: null as string | null,
        protein: null as string | null,
        flavours: new Set<string>(),
        toppings: new Set<string>(),
      }
      for (let k = 0; k < 40; k++) {
        const id = all[Math.floor(r() * all.length)]
        const cat = id.split('.')[0]
        s = reduce(s, sel(id))
        if (cat === 'base') model.base = id
        else if (cat === 'protein')
          model.protein = id // protein choice is not gated on base
        else if (model.base && model.protein) {
          const set = cat === 'flavour' ? model.flavours : model.toppings
          const max = cat === 'flavour' ? 2 : 3
          if (set.has(id)) set.delete(id)
          else if (set.size < max) set.add(id)
        }
      }
      expect(s.selection.base).toBe(model.base)
      expect(s.selection.protein).toBe(model.protein)
      expect(new Set(filled(s.selection.flavours))).toEqual(model.flavours)
      expect(new Set(filled(s.selection.toppings))).toEqual(model.toppings)
    }
  })
})
