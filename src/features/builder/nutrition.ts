import type { IngredientIndex } from './ingredientRepository'
import { filled } from './selectionRules'
import type { BuilderIngredient, DataStatus, MacroValues, Selection } from './types'

export function selectedIngredients(s: Selection, index: IngredientIndex): BuilderIngredient[] {
  return [s.base, s.protein, ...filled(s.flavours), ...filled(s.toppings)]
    .filter((id): id is string => id !== null)
    .map((id) => index.byId.get(id))
    .filter((i): i is BuilderIngredient => Boolean(i))
}

export interface NutritionTotals extends MacroValues {
  dataStatus: DataStatus
}

/** Pure sum of per-ingredient values for the canonical selection. */
export function computeNutrition(s: Selection, index: IngredientIndex): NutritionTotals {
  const t = { energyKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  for (const i of selectedIngredients(s, index)) {
    t.energyKcal += i.values.energyKcal
    t.proteinG += i.values.proteinG
    t.carbsG += i.values.carbsG
    t.fatG += i.values.fatG
  }
  const round = (n: number) => Math.round(n * 10) / 10
  return {
    energyKcal: Math.round(t.energyKcal),
    proteinG: round(t.proteinG),
    carbsG: round(t.carbsG),
    fatG: round(t.fatG),
    dataStatus: index.source.dataStatus,
  }
}
