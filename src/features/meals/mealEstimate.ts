import { fromCatalogComponents } from '../builder/configuration'
import type { IngredientIndex } from '../builder/ingredientRepository'
import { computeNutrition, type NutritionTotals } from '../builder/nutrition'
import { computePrice } from '../builder/pricing'
import { isComplete } from '../builder/selectionRules'
import { toConfiguration } from '../builder/configuration'
import type { BowlConfiguration, Selection } from '../builder/types'
import type { SignatureBowl } from '../catalog/types'

/**
 * ILLUSTRATIVE estimate for a catalog bowl, derived from the Stage 4 builder fixture
 * values of its components (D-024). Only produced when EVERY component maps to a builder
 * ingredient; otherwise 'pending'. Never a validated value — the Stage 3 Verified<T>
 * fields remain the only source of validated price/nutrition/allergens.
 */
export type MealEstimate =
  | {
      status: 'illustrative'
      nutrition: NutritionTotals
      priceMinor: number
      selection: Selection
      configuration: BowlConfiguration
    }
  | { status: 'pending'; unsupported: string[] }

export function estimateBowl(bowl: SignatureBowl, index: IngredientIndex): MealEstimate {
  const { selection, unsupported } = fromCatalogComponents(bowl.components, index)
  if (unsupported.length || !isComplete(selection)) return { status: 'pending', unsupported }
  return {
    status: 'illustrative',
    nutrition: computeNutrition(selection, index),
    priceMinor: computePrice(selection, index).amountMinor,
    selection,
    configuration: toConfiguration(selection)!,
  }
}
