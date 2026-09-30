import { CATEGORIES, SLOT_COUNT, type BuilderState, type Category, type Selection } from './types'
import type { IngredientIndex } from './ingredientRepository'

export const LIMITS: Record<Category, { min: number; max: number }> = {
  base: { min: 1, max: 1 },
  protein: { min: 1, max: 1 },
  flavour: { min: 0, max: SLOT_COUNT.flavour },
  topping: { min: 0, max: SLOT_COUNT.topping },
}

export const EMPTY_SELECTION: Selection = {
  base: null,
  protein: null,
  flavours: [null, null],
  toppings: [null, null, null],
}

export const initialState = (selection: Selection = EMPTY_SELECTION): BuilderState => ({
  selection,
  step: 'base',
  notice: null,
})

export type BuilderAction =
  | { type: 'select'; id: string }
  | { type: 'goTo'; step: Category }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'load'; selection: Selection; step?: Category }
  | { type: 'dismissNotice' }

export const filled = (slots: readonly (string | null)[]) =>
  slots.filter((s): s is string => s !== null)

export function isComplete(s: Selection): boolean {
  return s.base !== null && s.protein !== null
}

export function isCategorySatisfied(s: Selection, c: Category): boolean {
  if (c === 'base') return s.base !== null
  if (c === 'protein') return s.protein !== null
  return filled(c === 'flavour' ? s.flavours : s.toppings).length > 0
}

/** A step can be visited once every earlier required step is satisfied. */
export function canVisit(s: Selection, step: Category): boolean {
  if (step === 'base') return true
  if (step === 'protein') return s.base !== null
  return isComplete(s)
}

/** Can the user advance from `step` with the current selection? */
export function canAdvance(s: Selection, step: Category): boolean {
  const i = CATEGORIES.indexOf(step)
  return i < CATEGORIES.length - 1 && canVisit(s, CATEGORIES[i + 1])
}

function toggleSlot(slots: readonly (string | null)[], id: string): (string | null)[] | 'full' {
  const at = slots.indexOf(id)
  if (at >= 0) return slots.map((s, i) => (i === at ? null : s))
  const free = slots.indexOf(null)
  if (free < 0) return 'full'
  return slots.map((s, i) => (i === free ? id : s))
}

/** Normalises any selection against the index: unknown/misfiled ids dropped, limits enforced, duplicates removed. */
export function sanitizeSelection(s: Partial<Selection>, index: IngredientIndex): Selection {
  const valid = (id: string | null | undefined, c: Category) =>
    id && index.byId.get(id)?.category === c ? id : null
  const slots = (ids: readonly (string | null)[] | undefined, c: 'flavour' | 'topping') => {
    const out: (string | null)[] = []
    for (const id of ids ?? []) {
      const v = valid(id, c)
      if (v && !out.includes(v) && filled(out).length < SLOT_COUNT[c]) out.push(v)
    }
    while (out.length < SLOT_COUNT[c]) out.push(null)
    return out
  }
  return {
    base: valid(s.base, 'base'),
    protein: valid(s.protein, 'protein'),
    flavours: slots(s.flavours, 'flavour'),
    toppings: slots(s.toppings, 'topping'),
  }
}

/** Pure reducer: the single canonical source of builder state. */
export function createReducer(index: IngredientIndex) {
  return function reducer(state: BuilderState, action: BuilderAction): BuilderState {
    switch (action.type) {
      case 'select': {
        const ing = index.byId.get(action.id)
        if (!ing) return state
        const s = state.selection
        if (ing.category === 'base' || ing.category === 'protein') {
          if (s[ing.category] === ing.id) return state.notice ? { ...state, notice: null } : state
          return { ...state, selection: { ...s, [ing.category]: ing.id }, notice: null }
        }
        if (!canVisit(s, ing.category)) return state
        const key = ing.category === 'flavour' ? 'flavours' : 'toppings'
        const next = toggleSlot(s[key], ing.id)
        if (next === 'full')
          return { ...state, notice: { category: ing.category, attemptedId: ing.id } }
        return { ...state, selection: { ...s, [key]: next }, notice: null }
      }
      case 'goTo':
        return canVisit(state.selection, action.step)
          ? { ...state, step: action.step, notice: null }
          : state
      case 'next': {
        if (!canAdvance(state.selection, state.step)) return state
        return { ...state, step: CATEGORIES[CATEGORIES.indexOf(state.step) + 1], notice: null }
      }
      case 'back': {
        const i = CATEGORIES.indexOf(state.step)
        return i > 0 ? { ...state, step: CATEGORIES[i - 1], notice: null } : state
      }
      case 'load': {
        const selection = sanitizeSelection(action.selection, index)
        const step = action.step && canVisit(selection, action.step) ? action.step : 'base'
        return { selection, step, notice: null }
      }
      case 'dismissNotice':
        return state.notice ? { ...state, notice: null } : state
    }
  }
}

/** Selected IDs for one category, in slot order. */
export function selectedIn(s: Selection, c: Category): string[] {
  if (c === 'base') return s.base ? [s.base] : []
  if (c === 'protein') return s.protein ? [s.protein] : []
  return filled(c === 'flavour' ? s.flavours : s.toppings)
}
