import { ILLUSTRATIVE_SOURCE } from './illustrativeIngredients'
import type { BuilderIngredient, Category, IngredientSource } from './types'

/**
 * Lookup helpers over one ingredient source. Stage 7 swaps ILLUSTRATIVE_SOURCE for a
 * validated standardized-recipe source with the same shape.
 */
export interface IngredientIndex {
  source: IngredientSource
  byId: ReadonlyMap<string, BuilderIngredient>
  byCategory: Readonly<Record<Category, readonly BuilderIngredient[]>>
}

export function indexIngredients(source: IngredientSource): IngredientIndex {
  const byId = new Map(source.ingredients.map((i) => [i.id, i]))
  const byCategory = { base: [], protein: [], flavour: [], topping: [] } as Record<
    Category,
    BuilderIngredient[]
  >
  for (const i of source.ingredients) byCategory[i.category].push(i)
  return { source, byId, byCategory }
}

export const defaultIngredientIndex = indexIngredients(ILLUSTRATIVE_SOURCE)
