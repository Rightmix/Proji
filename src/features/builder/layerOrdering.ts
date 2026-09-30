import { ANIMATION_PRESETS } from './animationPresets'
import type { IngredientIndex } from './ingredientRepository'
import type { Category, Selection } from './types'

export interface BowlLayer {
  /** Stable React key: category + slot + ingredient. A change of ingredient = new layer. */
  key: string
  category: Category
  slot: number
  ingredientId: string
  name: string
  src: string
  placeholderColor: string
  zIndex: number
  /** Degrees; flavour/topping assets are drawn in one sector and rotated per slot. */
  rotation: number
  animation: (typeof ANIMATION_PRESETS)[Category]
}

/** Deterministic stacking: base < protein < flavours < toppings. */
const Z: Record<Category, number> = { base: 10, protein: 20, flavour: 30, topping: 40 }
const ROTATIONS: Record<Category, readonly number[]> = {
  base: [0],
  protein: [0],
  flavour: [0, 180],
  topping: [60, 180, 300],
}

export function buildLayers(s: Selection, index: IngredientIndex): BowlLayer[] {
  const out: BowlLayer[] = []
  const push = (category: Category, slot: number, id: string | null) => {
    const ing = id ? index.byId.get(id) : undefined
    if (!ing) return
    out.push({
      key: `${category}:${slot}:${ing.id}`,
      category,
      slot,
      ingredientId: ing.id,
      name: ing.name,
      src: ing.layerSrc,
      placeholderColor: ing.placeholderColor,
      zIndex: Z[category] + slot,
      rotation: ROTATIONS[category][slot] ?? 0,
      animation: ANIMATION_PRESETS[category],
    })
  }
  push('base', 0, s.base)
  push('protein', 0, s.protein)
  s.flavours.forEach((id, i) => push('flavour', i, id))
  s.toppings.forEach((id, i) => push('topping', i, id))
  return out
}
