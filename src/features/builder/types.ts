/** Stage 4 builder domain types. Ingredient IDs follow the Stage 3 `role.slug` convention. */
export const CATEGORIES = ['base', 'protein', 'flavour', 'topping'] as const
export type Category = (typeof CATEGORIES)[number]

export interface MacroValues {
  energyKcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

/**
 * ILLUSTRATIVE design-fixture values for the visual prototype. Not validated nutrition,
 * not approved prices. Stage 7 replaces the source with validated standardized recipes.
 */
export interface IllustrativeValues extends MacroValues {
  priceMinor: number // paise
}

export interface BuilderIngredient {
  /** `category.slug`, e.g. `base.brown-rice-kanji` (shared with Stage 3 catalog). */
  id: string
  category: Category
  name: string
  description: string
  values: IllustrativeValues
  /** Transparent overhead layer aligned to the shared bowl canvas. */
  layerSrc: string
  thumbnailSrc: string
  /** Colour used while the layer loads or if it fails. */
  placeholderColor: string
}

export type DataStatus = 'illustrative-fixture' | 'validated'

export interface IngredientSource {
  dataStatus: DataStatus
  ingredients: readonly BuilderIngredient[]
}

export const SLOT_COUNT = { flavour: 2, topping: 3 } as const

export interface Selection {
  base: string | null
  protein: string | null
  /** Fixed slots keep layer placement stable when another item is removed. */
  flavours: readonly (string | null)[]
  toppings: readonly (string | null)[]
}

export interface LimitNotice {
  category: 'flavour' | 'topping'
  attemptedId: string
}

export interface BuilderState {
  selection: Selection
  step: Category
  notice: LimitNotice | null
}

/**
 * Serializable bowl configuration — the boundary handed to Stage 5 (saved bowls),
 * Stage 6 (cart, server-side repricing), Stage 8 (kitchen) and Stage 9 (subscriptions).
 * It carries IDs only; prices/nutrition are always recomputed from a trusted source.
 */
export interface BowlConfiguration {
  version: 1
  baseId: string
  proteinId: string
  flavourIds: string[]
  toppingIds: string[]
}
