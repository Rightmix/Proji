import type { IngredientIndex } from '../builder/ingredientRepository'
import { computeNutrition, selectedIngredients, type NutritionTotals } from '../builder/nutrition'
import { computePrice } from '../builder/pricing'
import { decodeConfiguration, type MissingIngredient } from '../builder/savedBowlCodec'
import type { BuilderIngredient } from '../builder/types'
import type { CartItem } from './cartStore'

export type CartLine =
  | {
      status: 'ok'
      item: CartItem
      unitPriceMinor: number
      nutrition: NutritionTotals
      ingredients: BuilderIngredient[]
    }
  | { status: 'unavailable'; item: CartItem; missing: MissingIngredient[] | null }

/** Recompute every line from the trusted ingredient source (never from stored values). */
export function priceCart(items: readonly CartItem[], index: IngredientIndex) {
  const lines: CartLine[] = items.map((item) => {
    const r = decodeConfiguration(item.configuration, index)
    if (r.status !== 'ok')
      return { status: 'unavailable', item, missing: r.status === 'stale' ? r.missing : null }
    return {
      status: 'ok',
      item,
      unitPriceMinor: computePrice(r.selection, index).amountMinor,
      nutrition: computeNutrition(r.selection, index),
      ingredients: selectedIngredients(r.selection, index),
    }
  })
  const ok = lines.filter((l): l is Extract<CartLine, { status: 'ok' }> => l.status === 'ok')
  const sum = (f: (l: (typeof ok)[number]) => number) =>
    ok.reduce((t, l) => t + f(l) * l.item.quantity, 0)
  return {
    lines,
    subtotalMinor: sum((l) => l.unitPriceMinor),
    nutrition: {
      energyKcal: sum((l) => l.nutrition.energyKcal),
      proteinG: Math.round(sum((l) => l.nutrition.proteinG) * 10) / 10,
      carbsG: Math.round(sum((l) => l.nutrition.carbsG) * 10) / 10,
      fatG: Math.round(sum((l) => l.nutrition.fatG) * 10) / 10,
    },
    hasUnavailable: lines.some((l) => l.status !== 'ok'),
  }
}
